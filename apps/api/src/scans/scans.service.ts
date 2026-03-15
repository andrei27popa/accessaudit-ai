import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../common/database.module';

@Injectable()
export class ScansService {
  private lastWakeTime = 0;

  constructor(
    private prisma: PrismaService,
    @InjectQueue('scan') private scanQueue: Queue,
  ) {}

  async createFreeScan(url: string) {
    // Create a temporary project for free scans
    const domain = new URL(url).origin;

    // Find or create a "free scans" org
    let freeOrg = await this.prisma.organization.findFirst({
      where: { name: '__free_scans__' },
    });
    if (!freeOrg) {
      const systemUser = await this.prisma.user.upsert({
        where: { email: 'system@accessaudit.com' },
        create: { email: 'system@accessaudit.com', name: 'System', password: 'not-a-real-password', role: 'ADMIN' },
        update: {},
      });
      freeOrg = await this.prisma.organization.create({
        data: { name: '__free_scans__', ownerId: systemUser.id },
      });
    }

    // Create a temporary project
    const project = await this.prisma.project.create({
      data: {
        orgId: freeOrg.id,
        name: `Free Scan - ${domain}`,
        domain,
      },
    });

    return this.createScan(project.id, url, 'FREE');
  }

  async createProjectScan(userId: string, projectId: string, url: string, type: 'FREE' | 'FULL' | 'VERIFY' = 'FULL') {
    // Verify user has access
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          include: { memberships: { where: { userId } } },
        },
      },
    });

    if (!project || project.organization.memberships.length === 0) {
      throw new NotFoundException('Project not found');
    }

    return this.createScan(projectId, url, type);
  }

  private async createScan(projectId: string, url: string, type: 'FREE' | 'FULL' | 'VERIFY') {
    const scan = await this.prisma.scan.create({
      data: {
        projectId,
        url,
        type,
        status: 'QUEUED',
      },
    });

    // Add to scan queue
    await this.scanQueue.add('scan', {
      scanId: scan.id,
      url,
      type,
    });

    // Wake up workers service (Render free tier spins down after inactivity)
    this.wakeUpWorkers();

    return { id: scan.id, status: scan.status };
  }

  private wakeUpWorkers() {
    const workersUrl = process.env.WORKERS_URL;
    if (!workersUrl) {
      console.warn('[WakeUp] WORKERS_URL not set — cannot wake workers');
      return;
    }

    // Strategy: First ping with long timeout (65s) to let Render cold-start the service.
    // Render holds the HTTP request until the service spins up (~50s).
    // If the first ping succeeds, we're done. Otherwise, retry with shorter timeouts.
    const maxRetries = 3;

    const ping = async (attempt: number) => {
      const timeoutMs = attempt === 1 ? 65000 : 15000; // First attempt: 65s, retries: 15s
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        console.log(`[WakeUp] Pinging workers (attempt ${attempt}, timeout ${timeoutMs / 1000}s)...`);
        const res = await fetch(`${workersUrl}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          console.log(`[WakeUp] Workers are alive (attempt ${attempt})`);
          return;
        }
      } catch {
        console.log(`[WakeUp] Ping attempt ${attempt} failed`);
      }

      if (attempt < maxRetries) {
        setTimeout(() => ping(attempt + 1), 5000);
      } else {
        console.error(`[WakeUp] Workers failed to respond after ${maxRetries} attempts`);
      }
    };

    // Start pinging in background (don't block the request)
    ping(1);
  }

  async getScan(scanId: string) {
    const scan = await this.prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        project: { select: { name: true, domain: true } },
        pages: { select: { url: true, title: true, screenshotUrl: true, statusCode: true }, take: 1 },
      },
    });

    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    // If scan has been stuck in QUEUED for > 15 seconds, re-trigger worker wake-up (throttled to once per 30s)
    if (scan.status === 'QUEUED') {
      const queuedSeconds = (Date.now() - new Date(scan.createdAt).getTime()) / 1000;
      const timeSinceLastWake = (Date.now() - this.lastWakeTime) / 1000;
      if (queuedSeconds > 15 && timeSinceLastWake > 30) {
        this.lastWakeTime = Date.now();
        this.wakeUpWorkers();
      }
    }

    return {
      ...scan,
      screenshotUrl: scan.pages?.[0]?.screenshotUrl || null,
      pageTitle: scan.pages?.[0]?.title || null,
    };
  }

  async getScanIssues(scanId: string) {
    const scan = await this.prisma.scan.findUnique({ where: { id: scanId } });
    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    const issueGroups = await this.prisma.issueGroup.findMany({
      where: { scanId },
      orderBy: { priorityScore: 'desc' },
      include: {
        _count: { select: { instances: true } },
      },
    });

    return issueGroups.map((ig) => ({
      id: ig.id,
      ruleId: ig.ruleId,
      severity: ig.severity,
      title: ig.title,
      description: ig.description,
      helpUrl: ig.helpUrl,
      wcagRefs: ig.wcagRefs,
      occurrences: ig.occurrences,
      affectedPagesCount: ig.affectedPagesCount,
      priorityScore: ig.priorityScore,
      status: ig.status,
      aiFix: ig.aiFix,
      instanceCount: ig._count.instances,
    }));
  }

  async getIssueDetail(issueGroupId: string) {
    const issueGroup = await this.prisma.issueGroup.findUnique({
      where: { id: issueGroupId },
      include: {
        instances: {
          include: { page: { select: { url: true, title: true } } },
        },
      },
    });

    if (!issueGroup) {
      throw new NotFoundException('Issue not found');
    }

    return {
      ...issueGroup,
      instances: issueGroup.instances.map((i) => ({
        id: i.id,
        pageUrl: i.page.url,
        pageTitle: i.page.title,
        selector: i.selector,
        snippet: i.snippet,
        evidence: i.evidence,
      })),
    };
  }

  async updateIssueStatus(issueGroupId: string, status: 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'WONT_FIX') {
    return this.prisma.issueGroup.update({
      where: { id: issueGroupId },
      data: { status },
    });
  }

  triggerWakeUp() {
    this.wakeUpWorkers();
  }

  async claimScan(userId: string, scanId: string) {
    // Find the scan
    const scan = await this.prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        project: {
          include: { organization: true },
        },
      },
    });

    if (!scan) {
      throw new NotFoundException('Scan not found');
    }

    // Only allow claiming scans from __free_scans__ org
    if (scan.project.organization.name !== '__free_scans__') {
      throw new BadRequestException('This scan has already been claimed');
    }

    // Find the user's organization
    const membership = await this.prisma.membership.findFirst({
      where: { userId, role: { in: ['OWNER', 'ADMIN'] } },
    });

    if (!membership) {
      throw new BadRequestException('No organization found for user');
    }

    // Move the project (and all its scans) to the user's org
    await this.prisma.project.update({
      where: { id: scan.projectId },
      data: { orgId: membership.orgId },
    });

    return { claimed: true, projectId: scan.projectId, scanId };
  }
}

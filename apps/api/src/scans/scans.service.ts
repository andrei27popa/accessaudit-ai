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

    // Retry pinging workers multiple times as Render free tier takes ~50s to spin up
    const maxRetries = 12; // 12 retries × 5s = 60s total
    const retryDelay = 5000;

    const ping = async (attempt: number) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${workersUrl}/health`, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          console.log(`[WakeUp] Workers are alive (attempt ${attempt})`);
          return; // Workers are up, stop retrying
        }
      } catch {
        // Workers not ready yet
      }

      if (attempt < maxRetries) {
        setTimeout(() => ping(attempt + 1), retryDelay);
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
}

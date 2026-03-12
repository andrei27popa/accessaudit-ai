import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/database.module';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    // Find the user's organization
    const membership = await this.prisma.membership.findFirst({
      where: { userId, role: { in: ['OWNER', 'ADMIN'] } },
    });

    if (!membership) {
      throw new ForbiddenException('No organization found');
    }

    return this.prisma.project.create({
      data: {
        orgId: membership.orgId,
        name: dto.name,
        domain: dto.domain,
        sitemapUrl: dto.sitemapUrl,
      },
    });
  }

  async findAll(userId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      select: { orgId: true },
    });

    const orgIds = memberships.map((m) => m.orgId);

    const projects = await this.prisma.project.findMany({
      where: { orgId: { in: orgIds } },
      include: {
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { score: true, complianceLabel: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      domain: p.domain,
      sitemapUrl: p.sitemapUrl,
      detectedStack: p.detectedStack,
      createdAt: p.createdAt,
      latestScore: p.scans[0]?.score ?? null,
      latestComplianceLabel: p.scans[0]?.complianceLabel ?? null,
      lastScanAt: p.scans[0]?.createdAt ?? null,
    }));
  }

  async findOne(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          include: { memberships: { where: { userId } } },
        },
        scans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            status: true,
            url: true,
            score: true,
            complianceLabel: true,
            pagesScanned: true,
            createdAt: true,
            finishedAt: true,
          },
        },
      },
    });

    if (!project || project.organization.memberships.length === 0) {
      throw new NotFoundException('Project not found');
    }

    return {
      id: project.id,
      name: project.name,
      domain: project.domain,
      sitemapUrl: project.sitemapUrl,
      detectedStack: project.detectedStack,
      settings: project.settings,
      createdAt: project.createdAt,
      scans: project.scans,
    };
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
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

    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }
}

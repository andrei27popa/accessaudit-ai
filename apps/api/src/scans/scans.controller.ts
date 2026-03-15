import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ScansService } from './scans.service';
import { CreateScanDto, FreeScanDto } from './scans.dto';

@Controller()
export class ScansController {
  constructor(private scansService: ScansService) {}

  // Public free scan endpoint — limited to 3 per day per IP
  @Public()
  @Throttle({ default: { ttl: 86400000, limit: 3 } })
  @Post('free-scan')
  freeScan(@Body() dto: FreeScanDto) {
    return this.scansService.createFreeScan(dto.url);
  }

  // Authenticated project scan
  @UseGuards(JwtAuthGuard)
  @Post('projects/:projectId/scans')
  createScan(
    @CurrentUser('sub') userId: string,
    @Param('projectId') projectId: string,
    @Body() dto: CreateScanDto,
  ) {
    return this.scansService.createProjectScan(userId, projectId, dto.url, dto.type);
  }

  // Get scan status/results (public for free scans)
  @Public()
  @Get('scans/:scanId')
  getScan(@Param('scanId') scanId: string) {
    return this.scansService.getScan(scanId);
  }

  // Get scan issues
  @Public()
  @Get('scans/:scanId/issues')
  getScanIssues(@Param('scanId') scanId: string) {
    return this.scansService.getScanIssues(scanId);
  }

  // Get issue detail
  @Public()
  @Get('issues/:issueGroupId')
  getIssueDetail(@Param('issueGroupId') issueGroupId: string) {
    return this.scansService.getIssueDetail(issueGroupId);
  }

  // Update issue status (authenticated)
  @UseGuards(JwtAuthGuard)
  @Patch('issues/:issueGroupId')
  updateIssueStatus(
    @Param('issueGroupId') issueGroupId: string,
    @Body('status') status: 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'WONT_FIX',
  ) {
    return this.scansService.updateIssueStatus(issueGroupId, status);
  }

  // Claim a free scan to user's account (authenticated)
  @UseGuards(JwtAuthGuard)
  @Post('scans/:scanId/claim')
  claimScan(
    @CurrentUser('sub') userId: string,
    @Param('scanId') scanId: string,
  ) {
    return this.scansService.claimScan(userId, scanId);
  }

  // Wake up workers (public - used by frontend when scan is stuck)
  @Public()
  @SkipThrottle()
  @Post('wake-workers')
  wakeWorkers() {
    this.scansService.triggerWakeUp();
    return { status: 'wake-up triggered' };
  }
}

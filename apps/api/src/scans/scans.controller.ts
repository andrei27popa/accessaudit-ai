import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ScansService } from './scans.service';
import { CreateScanDto, FreeScanDto } from './scans.dto';

@Controller()
export class ScansController {
  constructor(private scansService: ScansService) {}

  // Public free scan endpoint
  @Public()
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
}

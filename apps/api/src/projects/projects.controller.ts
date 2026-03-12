import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.projectsService.findAll(userId);
  }

  @Get(':id')
  findOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.projectsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(userId, id, dto);
  }
}

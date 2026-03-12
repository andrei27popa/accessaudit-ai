import { IsString, IsOptional, IsUrl, MinLength, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsString()
  @MinLength(1)
  domain: string;

  @IsOptional()
  @IsUrl()
  sitemapUrl?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsUrl()
  sitemapUrl?: string;
}

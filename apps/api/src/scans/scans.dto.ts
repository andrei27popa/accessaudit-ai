import { IsString, IsUrl, IsOptional, IsEnum } from 'class-validator';

export class CreateScanDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsEnum(['FREE', 'FULL', 'VERIFY'])
  type?: 'FREE' | 'FULL' | 'VERIFY';
}

export class FreeScanDto {
  @IsUrl()
  url: string;
}

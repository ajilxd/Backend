import { IsString, IsUrl, IsArray, IsOptional } from "class-validator";

export class CreateCompanyDto {
  @IsString()
  @IsOptional()
  companyName!: string;

  @IsUrl()
  @IsOptional()
  websiteURL!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  industries?: string[];

  @IsString()
  ownerId!: string;
}

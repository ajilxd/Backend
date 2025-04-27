import { IsString, IsUrl, IsArray, IsOptional } from "class-validator";

export class CreateCompanyDto {
  @IsString()
  companyName!: string;

  @IsUrl()
  @IsOptional()
  websiteURL!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  industries?: string[];

  @IsString()
  ownerId!: string;
}

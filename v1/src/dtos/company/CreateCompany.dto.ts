import { IsString, IsUrl, IsArray } from "class-validator";

export class CreateCompany {
  @IsString()
  companyName!: string;

  @IsUrl()
  websiteURL!: string;

  @IsString()
  description!: string;

  @IsArray()
  @IsString({ each: true })
  industry!: string[];

  @IsString()
  ownerId!: string;
}

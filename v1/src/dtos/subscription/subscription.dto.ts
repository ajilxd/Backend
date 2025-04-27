import "reflect-metadata";
import { Expose } from "class-transformer";
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsNumber,
} from "class-validator";

export class CreateSubscriptionDto {
  @Expose()
  @IsString()
  billingCycle!: string;

  @Expose()
  @IsNumber()
  amount!: number;

  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsBoolean()
  isActive!: boolean;

  @Expose()
  @IsString()
  description!: string;

  @Expose()
  @IsArray()
  @IsString({ each: true })
  features!: string[];
}

// subscription-update.dto.ts

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  name?: number;

  @IsString()
  id!: string;

  @IsOptional()
  @IsString()
  billingCycle?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

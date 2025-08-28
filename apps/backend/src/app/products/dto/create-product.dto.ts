import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ArrayNotEmpty,
} from 'class-validator';
export class CreateProductDto {
  @IsString() title!: string;
  @IsString() slug!: string;
  @IsInt() @Min(0) priceCents!: number;
  @IsString() @IsOptional() currency?: string;
  @IsString() @IsOptional() description?: string;
  @IsArray() @ArrayNotEmpty() images!: string[];
  @IsString() @IsOptional() categoryId?: string;
}

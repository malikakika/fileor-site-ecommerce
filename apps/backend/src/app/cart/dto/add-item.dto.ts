import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class AddItemDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

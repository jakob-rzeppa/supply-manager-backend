import type ItemDto from "./item.dto.ts";

export default interface ProductDto {
  ean: string;
  user_id: string;

  name: string;
  description: string;

  items: ItemDto[];
}

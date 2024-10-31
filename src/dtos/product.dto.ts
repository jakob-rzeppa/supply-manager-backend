import type ItemDto from "./item.dto.ts";

export default interface ProductDto {
  id: string;

  ean: string | undefined;
  user_id: string;

  name: string;
  description: string;

  items: ItemDto[];
}

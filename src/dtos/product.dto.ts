import type ItemDto from "./item.dto.ts";

export default interface ProductDto {
    _id: string;
  
    ean: string;
    user_id: string;
  
    name: string;
    description: string;
  
    items: ItemDto[];
  }
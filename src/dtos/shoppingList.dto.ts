import ProductDto from "./product.dto";

export default interface ShoppingListDto {
  id: string;

  user_id: string;

  name: string;
  description: string;

  products: { product: ProductDto; amount: number }[];
}

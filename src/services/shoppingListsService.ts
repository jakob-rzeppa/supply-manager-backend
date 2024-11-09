import ProductDto from "../dtos/product.dto";
import ShoppingListDto from "../dtos/shoppingList.dto";

const shoppingListsService = {
  getShoppingLists: async (userId: string): Promise<ShoppingListDto[]> => {
    return [];
  },
  getShoppingListById: async (
    id: string,
    userId: string
  ): Promise<ShoppingListDto> => {
    return {} as ShoppingListDto;
  },
  createShoppingList: async (
    userId: string,
    shoppingListInfo: Omit<ShoppingListDto, "id" | "products" | "user_id">
  ): Promise<ShoppingListDto> => {
    return {} as ShoppingListDto;
  },
  updateShoppingList: async (
    id: string,
    userId: string,
    shoppingListInfo: Omit<ShoppingListDto, "id" | "products" | "user_id">
  ): Promise<ShoppingListDto> => {
    return {} as ShoppingListDto;
  },
  deleteShoppingList: async (id: string, userId: string): Promise<void> => {},
  addProductToShoppingList: async (
    id: string,
    userId: string,
    productId: string
  ): Promise<{ product: ProductDto; amount: number }> => {
    return { product: {} as ProductDto, amount: 0 };
  },
  removeProductFromShoppingList: async (
    id: string,
    userId: string,
    productId: string
  ): Promise<{ product: ProductDto; amount: number }> => {
    return { product: {} as ProductDto, amount: 0 };
  },
};

export default shoppingListsService;

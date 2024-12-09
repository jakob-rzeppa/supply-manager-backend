import mongoose from "mongoose";
import shoppingListsDatabase from "../database/shoppingLists/shoppingListsDatabase";
import ProductDto from "../dtos/product.dto";
import ShoppingListDto from "../dtos/shoppingList.dto";
import { Product } from "../database/product/productDatabase.types";
import { ShoppingList } from "../database/shoppingLists/shoppingListsDatabase.types";
import { catchPromiseError } from "../utilityFunctions/errorHandling";

const shoppingListsService = {
  getShoppingLists: async (userId: string): Promise<ShoppingListDto[]> => {
    const [error, shoppingLists] = await catchPromiseError(
      shoppingListsDatabase.getShoppingLists(
        new mongoose.Types.ObjectId(userId)
      )
    );
    if (error) {
      throw error;
    }

    const shoppingListsDto = shoppingLists.map((shoppingList: ShoppingList) => {
      return {
        id: shoppingList._id.toString(),
        user_id: shoppingList.user_id.toString(),
        name: shoppingList.name,
        description: shoppingList.description,
        products: shoppingList.products.map(
          (product: { product: Product; amount: number }) => {
            return {
              product: {
                id: product.product._id.toString(),
                ean: product.product.ean,
                user_id: product.product.user_id.toString(),
                name: product.product.name,
                description: product.product.description,
                items: product.product.items,
              },
              amount: product.amount,
            };
          }
        ),
      };
    });

    return shoppingListsDto;
  },
  getShoppingListById: async (
    id: string,
    userId: string
  ): Promise<ShoppingListDto> => {
    const [error, shoppingList] = await catchPromiseError(
      shoppingListsDatabase.getShoppingListById(
        new mongoose.Types.ObjectId(id),
        new mongoose.Types.ObjectId(userId)
      )
    );
    if (error) {
      throw error;
    }

    return {
      id: shoppingList._id.toString(),
      user_id: shoppingList.user_id.toString(),
      name: shoppingList.name,
      description: shoppingList.description,
      products: shoppingList.products.map(
        (product: { product: Product; amount: number }) => {
          return {
            product: {
              id: product.product._id.toString(),
              ean: product.product.ean,
              user_id: product.product.user_id.toString(),
              name: product.product.name,
              description: product.product.description,
              items: product.product.items,
            },
            amount: product.amount,
          };
        }
      ),
    };
  },
  createShoppingList: async (
    userId: string,
    shoppingListInfo: Omit<ShoppingListDto, "id" | "products" | "user_id">
  ): Promise<ShoppingListDto> => {
    const [error, shoppingList] = await catchPromiseError(
      shoppingListsDatabase.createShoppingList({
        user_id: new mongoose.Types.ObjectId(userId),
        name: shoppingListInfo.name,
        description: shoppingListInfo.description,
        products: [],
      })
    );
    if (error) {
      throw error;
    }

    return {
      id: shoppingList._id.toString(),
      user_id: shoppingList.user_id.toString(),
      name: shoppingList.name,
      description: shoppingList.description,
      products: [],
    };
  },
  updateShoppingList: async (
    id: string,
    userId: string,
    shoppingListInfo: Partial<
      Omit<ShoppingListDto, "id" | "products" | "user_id">
    >
  ): Promise<ShoppingListDto> => {
    return {} as ShoppingListDto;
  },
  deleteShoppingList: async (id: string, userId: string): Promise<void> => {},
  addProductToShoppingList: async (
    id: string,
    userId: string,
    productId: string
  ): Promise<{ product: ProductDto; amount: number }[]> => {
    return [{ product: {} as ProductDto, amount: 0 }];
  },
  removeProductFromShoppingList: async (
    id: string,
    userId: string,
    productId: string
  ): Promise<{ product: ProductDto; amount: number }[]> => {
    return [{ product: {} as ProductDto, amount: 0 }];
  },
};

export default shoppingListsService;

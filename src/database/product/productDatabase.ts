import NotFoundError from "../../errors/db/notFoundError";
import ResourceAlreadyExistsError from "../../errors/db/resourceAlreadyExistsError";
import { Product } from "./productDatabase.types";
import { ProductModel } from "./productDatabase.models";

const productDatabase = {
  checkIfEanAlreadyExistsForUser: async (ean: string, userId: string) => {
    const product = await ProductModel.findOne({ user_id: userId, ean });
    if (product) return true;
    return false;
  },

  getProducts: async (userId: string): Promise<Product[]> => {
    return await ProductModel.find({ user_id: userId });
  },

  getProductByEan: async (ean: string, userId: string): Promise<Product> => {
    const product = await ProductModel.findOne({ ean, user_id: userId });
    if (!product) throw new NotFoundError("Product not found");
    return product;
  },

  createProduct: async (product: Product): Promise<Product> => {
    if (
      await productDatabase.checkIfEanAlreadyExistsForUser(
        product.ean,
        product.user_id.toString()
      )
    )
      throw new ResourceAlreadyExistsError(
        "Product with this EAN already exists for this user"
      );

    const newProduct = new ProductModel(product);
    return await newProduct.save();
  },

  updateProduct: async (
    ean: string,
    userId: string,
    updateProductObject: Partial<Omit<Product, "ean" | "user_id">>
  ): Promise<Product> => {
    const product = await ProductModel.findOne({ ean, user_id: userId });
    if (!product) throw new NotFoundError("Product not found");

    if (updateProductObject.name !== undefined)
      product.name = updateProductObject.name;
    if (updateProductObject.description !== undefined)
      product.description = updateProductObject.description;
    if (updateProductObject.items !== undefined)
      product.items = updateProductObject.items;

    return await product.save();
  },

  deleteProductByEan: async (ean: string, userId: string): Promise<void> => {
    const deleteResponse = await ProductModel.deleteOne({
      ean,
      user_id: userId,
    });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundError("Product not found");
    }
  },
};

export default productDatabase;

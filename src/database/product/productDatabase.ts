import NotFoundError from "../../errors/db/notFoundError";
import ResourceAlreadyExistsError from "../../errors/db/resourceAlreadyExistsError";
import { Product } from "./productDatabase.types";
import { ProductModel } from "./productDatabase.models";

const productDatabase = {
  checkIfEanAlreadyExistsForUser: async (
    ean: string | undefined,
    userId: string
  ) => {
    if (!ean) return false;

    const product = await ProductModel.findOne({ user_id: userId, ean });
    if (product) return true;

    return false;
  },

  getProducts: async (userId: string): Promise<Product[]> => {
    return await ProductModel.find({ user_id: userId });
  },

  getProductById: async (id: string, userId: string): Promise<Product> => {
    const product = await ProductModel.findOne({ _id: id, user_id: userId });
    if (!product) throw new NotFoundError("Product not found");
    return product;
  },

  createProduct: async (product: Omit<Product, "_id">): Promise<Product> => {
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
    id: string,
    userId: string,
    updateProductObject: Partial<Omit<Product, "_id" | "user_id">>
  ): Promise<Product> => {
    const product = await ProductModel.findOne({ _id: id, user_id: userId });
    if (!product) throw new NotFoundError("Product not found");

    if (updateProductObject.name !== undefined)
      product.name = updateProductObject.name;
    if (updateProductObject.description !== undefined)
      product.description = updateProductObject.description;
    if (updateProductObject.items !== undefined)
      product.items = updateProductObject.items;
    if (updateProductObject.ean !== undefined)
      product.ean = updateProductObject.ean;

    return await product.save();
  },

  deleteProductById: async (id: string, userId: string): Promise<void> => {
    const deleteResponse = await ProductModel.deleteOne({
      _id: id,
      user_id: userId,
    });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundError("Product not found");
    }
  },
};

export default productDatabase;

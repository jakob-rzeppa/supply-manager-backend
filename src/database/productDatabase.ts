import NotFoundError from "../errors/db/notFoundError";
import ResourceAlreadyExistsError from "../errors/db/resourceAlreadyExistsError";
import { Product } from "./database.types";
import { ProductModel } from "./database.models";

const productDatabase = {
  checkIfEanAlreadyExistsForUser: async (userId: string, ean: string) => {
    const product = await ProductModel.findOne({ user_id: userId, ean });
    if (product) return true;
    return false;
  },

  getByUserId: async (userId: string): Promise<Product[]> => {
    return await ProductModel.find({ user_id: userId });
  },

  getById: async (id: string): Promise<Product> => {
    const product = await ProductModel.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  },

  getByEanAndUserId: async (ean: string, userId: string): Promise<Product> => {
    const product = await ProductModel.findOne({ ean, user_id: userId });
    if (!product) throw new NotFoundError("Product not found");
    return product;
  },

  create: async (product: Omit<Product, "_id">): Promise<Product> => {
    if (
      await productDatabase.checkIfEanAlreadyExistsForUser(
        product.user_id.toString(),
        product.ean
      )
    )
      throw new ResourceAlreadyExistsError(
        "Product with this EAN already exists for this user"
      );

    const newProduct = new ProductModel(product);
    return await newProduct.save();
  },

  update: async (
    id: string,
    updateProductObject: Partial<Omit<Product, "_id">>
  ): Promise<Product> => {
    const product = await ProductModel.findById(id);
    if (!product) throw new NotFoundError("Product not found");

    if (updateProductObject.ean !== undefined) {
      if (
        await productDatabase.checkIfEanAlreadyExistsForUser(
          updateProductObject.user_id
            ? updateProductObject.user_id.toString()
            : product.user_id.toString(),
          updateProductObject.ean
        )
      )
        throw new ResourceAlreadyExistsError(
          "Product with this EAN already exists for this user"
        );
      product.ean = updateProductObject.ean;
    }
    if (updateProductObject.name !== undefined)
      product.name = updateProductObject.name;
    if (updateProductObject.description !== undefined)
      product.description = updateProductObject.description;

    return await product.save();
  },

  //TODO: delete all items related to product
  deleteById: async (id: string): Promise<void> => {
    const deleteResponse = await ProductModel.deleteOne({
      _id: id,
    });
    if (deleteResponse.deletedCount === 0) {
      throw new NotFoundError("Product not found");
    }
  },

  //TODO: delete all items related to product
  deleteByEanAndUserId: async (ean: string, userId: string): Promise<void> => {
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

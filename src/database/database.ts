import {
  Product,
  User,
  UserUpdateObject,
  ProductUpdateObject,
} from "./database.types";

export default abstract class Database {
  private static instance: Database | undefined = undefined;

  public static async getInstance(db: "mongoDB" = "mongoDB") {
    if (!this.instance) {
      switch (db) {
        case "mongoDB": {
          const { default: MongoDatabase } = await import("./mongoDatabase");
          this.instance = new MongoDatabase();
          break;
        }
        default:
          throw new Error("Database not supported");
      }
    }

    return this.instance;
  }

  public abstract connect(test_db: boolean): void;

  // ---- user ----
  public abstract getUserById(id: string): Promise<User>;

  public abstract createUser(user: User): Promise<User>;

  public abstract updateUser(
    id: string,
    updateUserObject: UserUpdateObject
  ): Promise<User>;

  //TODO: delete all items and products related to user
  public abstract deleteUser(id: string): Promise<void>;

  // ---- product ----
  public abstract getProductsByUserId(userId: string): Promise<Product[]>;
  public abstract getProductById(id: string): Promise<Product>;
  public abstract getProductByEanAndUser(
    ean: string,
    userId: string
  ): Promise<Product>;

  //TODO: check if ean is unique for user
  public abstract createProduct(product: Product): Promise<Product>;

  //TODO: check if ean is unique for user
  public abstract updateProduct(
    id: string,
    updateProductObject: ProductUpdateObject
  ): Promise<Product>;

  //TODO: delete all items related to product
  public abstract deleteProductById(id: string): Promise<void>;
  public abstract deleteProductByEanAndUser(
    ean: string,
    userId: string
  ): Promise<void>;
}

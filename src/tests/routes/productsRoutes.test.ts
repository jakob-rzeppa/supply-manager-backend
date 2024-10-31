import request from "supertest";
import express from "express";
import productsRoutes from "../../routes/productsRoutes";
import productsService from "../../services/productsService";
import validateRequest from "../../validation/requestValidation";
import validateLocals from "../../validation/localsValidation";
import globalErrorHandlerMiddleware from "../../middlewares/globalErrorHandlerMiddleware";
import ValidationError from "../../errors/validation/validationError";

jest.mock("../../services/productsService");
jest.mock("../../validation/requestValidation");
jest.mock("../../validation/localsValidation");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.locals.user = { id: "testUserId" }; // Mock user
  next();
});
app.use("/products", productsRoutes);
app.use(globalErrorHandlerMiddleware);

describe("Products Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /products", () => {
    it("should return products for the user", async () => {
      const mockProducts = [{ id: "1", name: "Product 1" }];
      (productsService.getProductsByUserId as jest.Mock).mockResolvedValue(
        mockProducts
      );
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app).get("/products");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ products: mockProducts });
      expect(productsService.getProductsByUserId).toHaveBeenCalledWith(
        "testUserId"
      );
    });

    it("should return validation error when bad res.locals are supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app).get("/products");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return an error", async () => {
      (productsService.getProductsByUserId as jest.Mock).mockRejectedValue(
        new Error("Error")
      );
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app).get("/products");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });
  });

  describe("GET /products/:id", () => {
    it("should return a product by id", async () => {
      const mockProduct = { id: "1", name: "Product 1" };
      (productsService.getProductByIdAndUserId as jest.Mock).mockResolvedValue(
        mockProduct
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app).get("/products/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
      expect(productsService.getProductByIdAndUserId).toHaveBeenCalledWith(
        "1",
        "testUserId"
      );
    });

    it("should return validation error when a bad request is supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app).get("/products/1");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return validation error when bad res.locals are supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app).get("/products/1");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return an error", async () => {
      (productsService.getProductByIdAndUserId as jest.Mock).mockRejectedValue(
        new Error("Error")
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app).get("/products/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const mockProductId = "1";
      (productsService.createProduct as jest.Mock).mockResolvedValue(
        mockProductId
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app)
        .post("/products")
        .send({ name: "New Product" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: mockProductId });
      expect(productsService.createProduct).toHaveBeenCalledWith("testUserId", {
        name: "New Product",
      });
    });

    it("should return validation error when a bad request is supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app)
        .post("/products")
        .send({ name: "New Product" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return validation error when bad res.locals are supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app)
        .post("/products")
        .send({ name: "New Product" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return an error", async () => {
      (productsService.createProduct as jest.Mock).mockRejectedValue(
        new Error("Error")
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app)
        .post("/products")
        .send({ name: "New Product" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });
  });

  describe("PUT /products/:id", () => {
    it("should update a product", async () => {
      const mockProduct = { id: "1", name: "Updated Product" };
      (productsService.updateProduct as jest.Mock).mockResolvedValue(
        mockProduct
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app)
        .put("/products/1")
        .send({ name: "Updated Product" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
      expect(productsService.updateProduct).toHaveBeenCalledWith(
        "1",
        "testUserId",
        { name: "Updated Product" }
      );
    });

    it("should return validation error when a bad request is supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app)
        .put("/products/1")
        .send({ name: "Updated Product" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return validation error when bad res.locals are supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app)
        .put("/products/1")
        .send({ name: "Updated Product" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return an error", async () => {
      (productsService.updateProduct as jest.Mock).mockRejectedValue(
        new Error("Error")
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app)
        .put("/products/1")
        .send({ name: "Updated Product" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });
  });

  describe("DELETE /products/:id", () => {
    it("should delete a product", async () => {
      (productsService.deleteProductByid as jest.Mock).mockResolvedValue(null);
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app).delete("/products/1");

      expect(response.status).toBe(204);
      expect(productsService.deleteProductByid).toHaveBeenCalledWith(
        "1",
        "testUserId"
      );
    });

    it("should return validation error when a bad request is supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app).delete("/products/1");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return validation error when bad res.locals are supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app).delete("/products/1");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return an error", async () => {
      (productsService.deleteProductByid as jest.Mock).mockRejectedValue(
        new Error("Error")
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app).delete("/products/1");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });
  });

  describe("POST /products/:id/items", () => {
    it("should add an item to a product", async () => {
      const mockItems = [{ id: "1", name: "Item 1" }];
      (productsService.addProductItem as jest.Mock).mockResolvedValue(
        mockItems
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app)
        .post("/products/1/items")
        .send({ name: "Item 1" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ items: mockItems });
      expect(productsService.addProductItem).toHaveBeenCalledWith(
        "1",
        "testUserId",
        { name: "Item 1" }
      );
    });

    it("should return validation error when a bad request is supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app)
        .post("/products/1/items")
        .send({ name: "Item 1" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return validation error when bad res.locals are supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app)
        .post("/products/1/items")
        .send({ name: "Item 1" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return an error", async () => {
      (productsService.addProductItem as jest.Mock).mockRejectedValue(
        new Error("Error")
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app)
        .post("/products/1/items")
        .send({ name: "Item 1" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });

    it("should return an error", async () => {
      (productsService.addProductItem as jest.Mock).mockRejectedValue(
        new Error("Error")
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app)
        .post("/products/1/items")
        .send({ name: "Item 1" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });
  });

  describe("PUT /products/:id/items/:index", () => {
    it("should update an item in a product", async () => {
      const mockItems = [{ id: "1", name: "Updated Item" }];
      (productsService.updateProductItem as jest.Mock).mockResolvedValue(
        mockItems
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app)
        .put("/products/1/items/0")
        .send({ name: "Updated Item" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockItems);
      expect(productsService.updateProductItem).toHaveBeenCalledWith(
        "1",
        "testUserId",
        0,
        { name: "Updated Item" }
      );
    });

    it("should return validation error when a bad request is supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app)
        .put("/products/1/items/0")
        .send({ name: "Updated Item" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return validation error when bad res.locals are supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app)
        .put("/products/1/items/0")
        .send({ name: "Updated Item" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return an error", async () => {
      (productsService.updateProductItem as jest.Mock).mockRejectedValue(
        new Error("Error")
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app)
        .put("/products/1/items/0")
        .send({ name: "Updated Item" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });

    it("should return an error", async () => {
      (productsService.updateProductItem as jest.Mock).mockRejectedValue(
        new Error("Error")
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app)
        .put("/products/1/items/0")
        .send({ name: "Updated Item" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });
  });

  describe("DELETE /products/:id/items/:index", () => {
    it("should delete an item from a product", async () => {
      (productsService.deleteProductItem as jest.Mock).mockResolvedValue(
        undefined
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app).delete("/products/1/items/0");

      expect(response.status).toBe(204);
      expect(productsService.deleteProductItem).toHaveBeenCalledWith(
        "1",
        "testUserId",
        0
      );
    });

    it("should return validation error when a bad request is supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app).delete("/products/1/items/0");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return validation error when bad res.locals are supplied", async () => {
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(
        new ValidationError("Validation Error")
      );

      const response = await request(app).delete("/products/1/items/0");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: "Validation Error" });
    });

    it("should return an error", async () => {
      (productsService.deleteProductItem as jest.Mock).mockRejectedValue(
        new Error("Error")
      );
      (validateRequest as jest.Mock).mockReturnValue(null);
      (validateLocals as jest.Mock).mockReturnValue(null);

      const response = await request(app).delete("/products/1/items/0");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Internal Server Error" });
    });
  });
});

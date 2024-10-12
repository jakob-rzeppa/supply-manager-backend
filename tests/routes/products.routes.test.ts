import {afterAll} from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import Database from "../../src/database/database.ts";
import getProductsRoutes from "../../src/routes/products.routes.ts";
import express from "express";
import { assertEquals } from "@std/assert/equals";
import type { Product } from "../../src/database/database.types.ts";
import mongoose from "mongoose";
import type ProductDto from "../../src/dtos/product.dto.ts";
import type CreateProductDto from "../../src/dtos/createProduct.dto.ts";
import type { UpdateProductDto } from "../../src/dtos/updateProduct.dto.ts";

const db: Database = {} as unknown as Database;

//TODO userID in JWT payload

const mockId = "ffffffffffffffffffffffff";

const mockProduct: Product = {
    _id: new mongoose.Types.ObjectId(mockId),
    name: "mockProduct",
    description: "description",
    ean: "1234567890123",
    user_id: new mongoose.Types.ObjectId(mockId),
    items: [],
};

const expectedProduct: ProductDto = {
    _id: mockId,
    name: mockProduct.name,
    description: mockProduct.description,
    ean: mockProduct.ean,
    user_id: mockId,
    items: mockProduct.items,
};

const createProductDto: CreateProductDto = {
    name: mockProduct.name,
    description: mockProduct.description,
    ean: mockProduct.ean,
    user_id: mockId,
};

const updateProductDto: UpdateProductDto = {
    name: "updatedProduct",
    description: "updatedDescription",
    ean: "111111111111111111"
};

const app = express();
const routes = getProductsRoutes(db);
app.use("/products", routes);
const server = app.listen(3060);

Deno.test("GET /products should return products with the right User id", async () => {
    const getProductByIdStub = stub(db, "getProductsByUserId", () => Promise.resolve([mockProduct]));

    const response = await fetch("http://localhost:3060/products");
    const body = await response.json();

    assertEquals(response.status, 200);
    assertEquals(body, { data: [expectedProduct], message: "Products found", error: null});

    getProductByIdStub.restore();
});

Deno.test("GET /products/:id should return a product", async () => {
    const getProductByIdStub = stub(db, "getProductById", () => Promise.resolve(mockProduct));

    const response = await fetch(`http://localhost:3060/products/${mockId}`);
    const body = await response.json();

    assertEquals(response.status, 200);
    assertEquals(body, { data: expectedProduct, message: "Product found", error: null});

    getProductByIdStub.restore();
});

Deno.test("POST /products should create a product", async () => {
    const createProductStub = stub(db, "createProduct", () => Promise.resolve(mockProduct));

    const response = await fetch("http://localhost:3060/products", {
        method: "POST",
        body: JSON.stringify(createProductDto),
        headers: { "Content-Type": "application/json" },
    });
    const body = await response.json();

    assertEquals(response.status, 201);
    assertEquals(body, { data: expectedProduct, message: "Product created", error: null});

    createProductStub.restore();
});

Deno.test("PUT /products/:id should update a product", async () => {
    const updateProductStub = stub(db, "updateProduct", () => Promise.resolve(mockProduct));

    const response = await fetch(`http://localhost:3060/products/${mockId}`, {
        method: "PUT",
        body: JSON.stringify(createProductDto),
        headers: { "Content-Type": "application/json" },
    });
    const body = await response.json();

    assertEquals(response.status, 200);
    assertEquals(body, {data: expectedProduct, message: "Product updated", error: null});

    updateProductStub.restore();
});

Deno.test("DELETE /products/:id should delete a product", async () => {
    const deleteProductByIdStub = stub(db, "deleteProductById", () => Promise.resolve());

    const response = await fetch(`http://localhost:3060/products/${mockId}`, { method: "DELETE" });
    const body = await response.json();

    assertEquals(response.status, 200);
    assertEquals(body, { message: "Product deleted", error: null });

    deleteProductByIdStub.restore();
});

afterAll(() => server.close());
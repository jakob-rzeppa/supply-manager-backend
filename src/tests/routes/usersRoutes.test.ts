import request from "supertest";
import express from "express";
import usersRoutes from "../../routes/usersRoutes";
import usersService from "../../services/usersService";
import globalErrorHandlerMiddleware from "../../middlewares/globalErrorHandlerMiddleware";

const app = express();
app.use(express.json());
app.use("/users", usersRoutes);
app.use(globalErrorHandlerMiddleware);

jest.mock("../../services/usersService");

describe("Users Routes", () => {
  describe("POST /users", () => {
    it("should create a new user and return access token", async () => {
      const mockAccessToken = "mockAccessToken";
      (usersService.createUser as jest.Mock).mockResolvedValue(mockAccessToken);

      const response = await request(app).post("/users").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ accessToken: mockAccessToken });
    });

    it("should return validation error for invalid input", async () => {
      const response = await request(app)
        .post("/users")
        .send({ name: "", email: "invalid-email", password: "" });

      expect(response.status).toBe(400);
    });
  });

  describe("PUT /users/:id", () => {
    it("should update an existing user", async () => {
      const mockUser = { id: "1", name: "John Doe", email: "john@example.com" };
      (usersService.updateUser as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .put("/users/1")
        .send({ name: "John Doe", email: "john@example.com" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
    });

    it("should return validation error for invalid input", async () => {
      const response = await request(app)
        .put("/users/1")
        .send({ name: "", email: "invalid-email" });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /users/:id", () => {
    it("should return 501 for unimplemented route", async () => {
      const response = await request(app).delete("/users/1");

      expect(response.status).toBe(501);
    });
  });
});

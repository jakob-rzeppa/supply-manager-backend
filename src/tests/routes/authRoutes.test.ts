import request from "supertest";
import express from "express";
import authRoutes from "../../routes/authRoutes";
import authService from "../../services/authService";
import globalErrorHandlerMiddleware from "../../middlewares/globalErrorHandlerMiddleware";
import AuthorisationError from "../../errors/auth/authorisationError";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);
app.use(globalErrorHandlerMiddleware);

jest.mock("../../services/authService");

describe("Auth Routes", () => {
  describe("POST /auth/login", () => {
    it("should return 200 and access token on successful login", async () => {
      const mockAccessToken = "mockAccessToken";
      (authService.login as jest.Mock).mockResolvedValue(mockAccessToken);

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "password" });

      expect(response.status).toBe(200);
      expect(response.body.data.accessToken).toBe(mockAccessToken);
      expect(response.body.message).toBe("Sucessfully logged in");
    });

    it("should return 400 if email or password is missing", async () => {
      const response = await request(app).post("/auth/login").send({});

      expect(response.status).toBe(400);
    });

    it("should return 403 if invalid credentials", async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new AuthorisationError("Invalid password")
      );

      const response = await request(app)
        .post("/auth/login")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /auth/logout", () => {
    it("should return 200 on successful logout", async () => {
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete("/auth/logout")
        .send({ token: "mockToken" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Sucessfully logged out");
    });

    it("should return 400 if token is missing", async () => {
      const response = await request(app).delete("/auth/logout").send({});

      expect(response.status).toBe(400);
    });

    it("should return 500 if logout fails", async () => {
      (authService.logout as jest.Mock).mockRejectedValue(
        new Error("Logout failed")
      );

      const response = await request(app)
        .delete("/auth/logout")
        .send({ token: "mockToken" });

      expect(response.status).toBe(500);
    });
  });
});

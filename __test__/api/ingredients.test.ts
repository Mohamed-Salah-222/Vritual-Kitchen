/* eslint-disable @typescript-eslint/no-require-imports */

// Mock NextRequest and NextResponse before importing anything
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
    })),
  },
}));

// Mock dependencies
jest.mock("@/lib/mongodb");
jest.mock("@/models/Ingredient");

describe.skip("/api/ingredients", () => {
  describe("GET", () => {
    it("should return 401 if user is not authenticated", async () => {
      const { auth } = require("@clerk/nextjs/server");
      auth.mockResolvedValueOnce({ userId: null });

      // Import after mocking to ensure mocks are in place
      const { GET } = await import("@/app/api/ingredients/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return ingredients for authenticated user", async () => {
      const { auth } = require("@clerk/nextjs/server");
      const Ingredient = require("@/models/Ingredient").default;

      auth.mockResolvedValueOnce({ userId: "test-user-id" });

      const mockIngredients = [
        { _id: "1", name: "Chicken", quantity: "500", unit: "grams" },
        { _id: "2", name: "Rice", quantity: "2", unit: "cups" },
      ];

      Ingredient.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockIngredients),
      });

      const { GET } = await import("@/app/api/ingredients/route");
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ingredients).toEqual(mockIngredients);
    });
  });

  describe("POST", () => {
    it("should create new ingredients", async () => {
      const { auth } = require("@clerk/nextjs/server");
      const Ingredient = require("@/models/Ingredient").default;

      auth.mockResolvedValueOnce({ userId: "test-user-id" });

      const mockSave = jest.fn().mockResolvedValue({ _id: "1" });
      Ingredient.mockImplementation(() => ({
        save: mockSave,
      }));

      // Mock request object
      const mockRequest = {
        json: async () => ({
          ingredients: [{ name: "Chicken", quantity: "500", unit: "grams", category: "protein" }],
        }),
      };

      const { POST } = await import("@/app/api/ingredients/route");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await POST(mockRequest as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import KitchenPage from "@/app/kitchen/page";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("Kitchen Page", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should show loading state initially", () => {
    mockFetch.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<KitchenPage />);
    expect(screen.getByText("Loading your kitchen...")).toBeInTheDocument();
  });

  it("should display ingredients after loading", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ingredients: [
          { _id: "1", name: "Chicken", quantity: "500", unit: "grams", category: "protein", isEssential: false, emoji: "🍗" },
          { _id: "2", name: "Rice", quantity: "2", unit: "cups", category: "carbs", isEssential: false, emoji: "🍚" },
        ],
      }),
    });

    render(<KitchenPage />);

    await waitFor(() => {
      expect(screen.getByText("Chicken")).toBeInTheDocument();
      expect(screen.getByText("Rice")).toBeInTheDocument();
    });
  });

  it("should show empty state when no ingredients", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ingredients: [] }),
    });

    render(<KitchenPage />);

    await waitFor(() => {
      expect(screen.getByText("Your kitchen is empty")).toBeInTheDocument();
    });
  });

  it("should filter ingredients by search term", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ingredients: [
          { _id: "1", name: "Chicken", quantity: "500", unit: "grams", category: "protein", isEssential: false, emoji: "🍗" },
          { _id: "2", name: "Rice", quantity: "2", unit: "cups", category: "carbs", isEssential: false, emoji: "🍚" },
        ],
      }),
    });

    render(<KitchenPage />);

    await waitFor(() => {
      expect(screen.getByText("Chicken")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search ingredients...");
    await userEvent.type(searchInput, "Chicken");

    expect(screen.getByText("Chicken")).toBeInTheDocument();
    expect(screen.queryByText("Rice")).not.toBeInTheDocument();
  });
});

import { parseAmount, extractUnit } from "../../lib/recipeUtils";

describe("Recipe Utility Functions", () => {
  describe("parseAmount", () => {
    it("should parse numeric amounts correctly", () => {
      expect(parseAmount("200g")).toBe(200);
      expect(parseAmount("2 cups")).toBe(2);
      expect(parseAmount("1.5 tbsp")).toBe(1.5);
    });

    it("should return 1 for invalid amounts", () => {
      expect(parseAmount("a handful")).toBe(1);
      expect(parseAmount("")).toBe(1);
    });
  });

  describe("extractUnit", () => {
    it("should extract grams correctly", () => {
      expect(extractUnit("200g")).toBe("grams");
      expect(extractUnit("200 grams")).toBe("grams");
    });

    it("should extract pieces correctly", () => {
      expect(extractUnit("2 pieces")).toBe("pieces");
      expect(extractUnit("3 pcs")).toBe("pieces");
    });

    it("should default to pieces for unknown units", () => {
      expect(extractUnit("a handful")).toBe("pieces");
    });
  });
});

import { describe, expect, it } from "vitest";
import { formatPreview } from "../../src/cli/preview.js";
import { generatePalette } from "../../src/core/generate.js";

describe("palette preview", () => {
  it("shows human-readable palette metadata", () => {
    const result = generatePalette({
      baseColor: "#2563EB",
      harmony: "analogous",
      harmonyTuning: "ui",
      neutralMode: "neutral",
      colorSteps: 3,
      neutralSteps: 3,
    });
    const preview = formatPreview(result, false);
    expect(preview).toContain("Harmony: Analogous");
    expect(preview).toContain("Harmony style: UI");
    expect(preview).toContain("Neutrals: Neutral gray");
  });

  it("hides irrelevant harmony adjustment for monochrome", () => {
    const result = generatePalette({
      baseColor: "#2563EB",
      harmony: "monochrome",
      neutralMode: "neutral",
      colorSteps: 3,
      neutralSteps: 3,
    });
    const preview = formatPreview(result, false);
    expect(preview).toContain("Harmony: Monochrome");
    expect(preview).not.toContain("Harmony style:");
  });
});

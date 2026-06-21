import { describe, expect, it } from "vitest";
import { CliArgumentError, parseCliArgs } from "../../src/cli/args.js";

describe("CLI argument parsing", () => {
  it("keeps no-argument startup interactive", () => {
    expect(parseCliArgs([])).toEqual({ name: "interactive" });
  });

  it("parses seeded exploration", () => {
    expect(parseCliArgs(["explore", "--seed", "8f3a21c4"]))
      .toEqual({ name: "explore", seed: "8f3a21c4" });
  });

  it("parses and normalizes generation options", () => {
    expect(parseCliArgs([
      "generate",
      "--base", "#abc",
      "--harmony", "triadic",
      "--tuning", "branding",
      "--neutral", "tinted",
      "--color-steps", "7",
      "--neutral-steps", "9",
      "--format", "css",
      "--output", "palette.css",
    ])).toEqual({
      name: "generate",
      baseColor: "#AABBCC",
      harmony: "triadic",
      harmonyTuning: "branding",
      neutralMode: "tinted",
      colorSteps: 7,
      neutralSteps: 9,
      format: "css",
      outputPath: "palette.css",
    });
  });

  it.each([
    ["unknown"],
    ["configure", "--seed", "1"],
    ["explore", "--format", "json"],
    ["generate", "--harmony", "square"],
    ["generate", "--format", "yaml"],
    ["generate", "--color-steps", "4"],
    ["generate", "--seed"],
    ["generate", "--format", "json", "--format", "css"],
  ])("rejects invalid arguments %j", (...args) => {
    expect(() => parseCliArgs(args)).toThrow(CliArgumentError);
  });
});

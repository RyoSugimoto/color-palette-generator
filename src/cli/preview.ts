import type {
  HarmonyMode,
  HarmonyTuning,
  NeutralMode,
  PaletteResult,
} from "../core/types.js";
import { formatHexOutput } from "./output.js";

const HARMONY_LABELS: Readonly<Record<HarmonyMode, string>> = {
  monochrome: "Monochrome",
  analogous: "Analogous",
  complementary: "Complementary",
  triadic: "Triadic",
};

const HARMONY_TUNING_LABELS: Readonly<Record<HarmonyTuning, string>> = {
  mechanical: "Fixed angles",
  ui: "UI",
  branding: "Branding",
  "data-visualization": "Data visualization",
};

const NEUTRAL_LABELS: Readonly<Record<NeutralMode, string>> = {
  neutral: "Neutral gray",
  tinted: "Base-tinted gray",
};

export function formatPreview(result: PaletteResult, useColor: boolean): string {
  const metadata = [
    `Base color: ${result.config.baseColor}`,
    `Harmony: ${HARMONY_LABELS[result.config.harmony]}`,
    ...(result.config.harmony === "monochrome"
      ? []
      : [`Harmony style: ${HARMONY_TUNING_LABELS[result.config.harmonyTuning ?? "mechanical"]}`]),
    `Neutrals: ${NEUTRAL_LABELS[result.config.neutralMode]}`,
  ];

  return [
    "",
    "Palette preview",
    ...metadata,
    "",
    formatHexOutput(result, useColor),
  ].join("\n");
}

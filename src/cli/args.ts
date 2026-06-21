import { normalizeHex } from "../core/color.js";
import {
  HARMONY_MODES,
  HARMONY_TUNINGS,
  NEUTRAL_MODES,
  STEP_COUNTS,
  type HarmonyMode,
  type HarmonyTuning,
  type NeutralMode,
  type RandomSeed,
  type StepCount,
} from "../core/types.js";

export type OutputFormat = "hex" | "json" | "css";

export type CliCommand =
  | { readonly name: "interactive" }
  | { readonly name: "configure" }
  | { readonly name: "help" }
  | { readonly name: "explore"; readonly seed?: RandomSeed }
  | {
    readonly name: "generate";
    readonly seed?: RandomSeed;
    readonly baseColor?: string;
    readonly harmony?: HarmonyMode;
    readonly harmonyTuning?: HarmonyTuning;
    readonly neutralMode?: NeutralMode;
    readonly colorSteps?: StepCount;
    readonly neutralSteps?: StepCount;
    readonly format: OutputFormat;
    readonly outputPath?: string;
  };

export class CliArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliArgumentError";
  }
}

export function parseCliArgs(args: readonly string[]): CliCommand {
  if (args.length === 0) return { name: "interactive" };
  if (args.includes("--help") || args.includes("-h")) return { name: "help" };

  const [command, ...options] = args;
  if (command === "configure") {
    if (options.length > 0) throw new CliArgumentError("The configure command does not accept options.");
    return { name: "configure" };
  }
  if (command === "explore") return parseExploreOptions(options);
  if (command === "generate") return parseGenerateOptions(options);
  throw new CliArgumentError(`Unknown command: ${command}`);
}

function parseExploreOptions(args: readonly string[]): CliCommand {
  const values = parseOptionValues(args, new Set(["--seed"]));
  const seed = values.get("--seed");
  return seed === undefined ? { name: "explore" } : { name: "explore", seed };
}

function parseGenerateOptions(args: readonly string[]): CliCommand {
  const values = parseOptionValues(args, new Set([
    "--seed",
    "--base",
    "--harmony",
    "--tuning",
    "--neutral",
    "--color-steps",
    "--neutral-steps",
    "--format",
    "--output",
  ]));
  const format = parseChoice(values.get("--format") ?? "hex", "format", ["hex", "json", "css"]);
  const base = values.get("--base");
  const seed = values.get("--seed");
  const harmony = optionalChoice(values.get("--harmony"), "harmony", HARMONY_MODES);
  const harmonyTuning = optionalChoice(values.get("--tuning"), "tuning", HARMONY_TUNINGS);
  const neutralMode = optionalChoice(values.get("--neutral"), "neutral mode", NEUTRAL_MODES);
  const colorSteps = optionalStepCount(values.get("--color-steps"), "color steps");
  const neutralSteps = optionalStepCount(values.get("--neutral-steps"), "neutral steps");
  const outputPath = values.get("--output");

  return {
    name: "generate",
    ...(seed === undefined ? {} : { seed }),
    ...(base === undefined ? {} : { baseColor: parseBaseColor(base) }),
    ...(harmony === undefined ? {} : { harmony }),
    ...(harmonyTuning === undefined ? {} : { harmonyTuning }),
    ...(neutralMode === undefined ? {} : { neutralMode }),
    ...(colorSteps === undefined ? {} : { colorSteps }),
    ...(neutralSteps === undefined ? {} : { neutralSteps }),
    format,
    ...(outputPath === undefined ? {} : { outputPath }),
  };
}

function parseOptionValues(
  args: readonly string[],
  allowed: ReadonlySet<string>,
): Map<string, string> {
  const values = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const option = args[index];
    const value = args[index + 1];
    if (option === undefined || !allowed.has(option)) {
      throw new CliArgumentError(`Unknown option: ${option ?? ""}`);
    }
    if (values.has(option)) throw new CliArgumentError(`Duplicate option: ${option}`);
    if (value === undefined || value.startsWith("--")) {
      throw new CliArgumentError(`Missing value for ${option}.`);
    }
    values.set(option, value);
  }
  return values;
}

function parseBaseColor(value: string): string {
  try {
    return normalizeHex(value);
  } catch {
    throw new CliArgumentError(`Invalid base color: ${value}`);
  }
}

function optionalChoice<const Values extends readonly string[]>(
  value: string | undefined,
  label: string,
  allowed: Values,
): Values[number] | undefined {
  return value === undefined ? undefined : parseChoice(value, label, allowed);
}

function parseChoice<const Values extends readonly string[]>(
  value: string,
  label: string,
  allowed: Values,
): Values[number] {
  if ((allowed as readonly string[]).includes(value)) return value as Values[number];
  throw new CliArgumentError(`Invalid ${label}: ${value}. Expected ${allowed.join(", ")}.`);
}

function optionalStepCount(value: string | undefined, label: string): StepCount | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if ((STEP_COUNTS as readonly number[]).includes(parsed)) return parsed as StepCount;
  throw new CliArgumentError(`Invalid ${label}: ${value}. Expected ${STEP_COUNTS.join(", ")}.`);
}

export const HELP_TEXT = `Quick Palette

Usage:
  quick-palette
  quick-palette explore [--seed <seed>]
  quick-palette configure
  quick-palette generate [options]
  quick-palette --help

Generate options:
  --seed <seed>            Reproduce a randomized palette
  --base <hex>             Base color (default: #2563EB)
  --harmony <mode>         monochrome, analogous, complementary, or triadic
  --tuning <purpose>       mechanical, ui, branding, or data-visualization
  --neutral <mode>         neutral or tinted
  --color-steps <count>    3, 5, 7, or 9 (default: 5)
  --neutral-steps <count>  3, 5, 7, or 9 (default: 5)
  --format <format>        hex, json, or css (default: hex)
  --output <path>          Write output to a file instead of stdout

Piping:
  Non-interactive generate output is written only to stdout, or only to the
  selected file with --output. Errors are written to stderr.`;

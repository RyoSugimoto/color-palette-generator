import { generatePalette } from "../core/generate.js";
import { generateRandomPaletteConfig } from "../core/random.js";
import type {
  PaletteConfig,
  PaletteResult,
  RandomPaletteConfigOptions,
  RandomPaletteConfigResult,
  RandomSeed,
} from "../core/types.js";
import { formatHexOutput } from "./output.js";
import {
  promptExplorationAction,
  type ExplorationAction,
  type PromptInterface,
} from "./prompt.js";
import { formatPreview } from "./preview.js";

const MAX_NEXT_ATTEMPTS = 1024;

export interface ExplorationCandidate extends RandomPaletteConfigResult {
  readonly result: PaletteResult;
}

export type ExplorationOutcome =
  | { readonly action: "accept"; readonly candidate: ExplorationCandidate }
  | { readonly action: "edit"; readonly config: PaletteConfig }
  | { readonly action: "quit" };

export interface ExplorationDependencies {
  readonly initialSeed?: RandomSeed;
  readonly randomConfig?: (
    options?: RandomPaletteConfigOptions,
  ) => RandomPaletteConfigResult;
  readonly generate?: (config: PaletteConfig) => PaletteResult;
  readonly promptAction?: (prompt: PromptInterface) => Promise<ExplorationAction>;
  readonly output?: (message: string) => void;
}

export async function explorePalettes(
  prompt: PromptInterface,
  useColor: boolean,
  dependencies: ExplorationDependencies = {},
): Promise<ExplorationOutcome> {
  const randomConfig = dependencies.randomConfig ?? generateRandomPaletteConfig;
  const generate = dependencies.generate ?? generatePalette;
  const promptAction = dependencies.promptAction ?? promptExplorationAction;
  const output = dependencies.output ?? console.log;
  const initialRandom = dependencies.initialSeed === undefined
    ? randomConfig()
    : randomConfig({ seed: dependencies.initialSeed });
  let candidate = createCandidate(initialRandom, generate);

  while (true) {
    output(`${formatPreview(candidate.result, useColor)}\n\nSeed: ${candidate.seed}`);
    const action = await promptAction(prompt);

    if (action === "accept") {
      output(`\n${formatHexOutput(candidate.result, useColor)}`);
      return { action, candidate };
    }
    if (action === "edit") return { action, config: candidate.config };
    if (action === "quit") return { action };
    candidate = nextCandidate(candidate, randomConfig, generate);
  }
}

function createCandidate(
  random: RandomPaletteConfigResult,
  generate: (config: PaletteConfig) => PaletteResult,
): ExplorationCandidate {
  return { ...random, result: generate(random.config) };
}

function nextCandidate(
  current: ExplorationCandidate,
  randomConfig: (options?: RandomPaletteConfigOptions) => RandomPaletteConfigResult,
  generate: (config: PaletteConfig) => PaletteResult,
): ExplorationCandidate {
  const currentSeed = Number.parseInt(current.seed, 16);
  for (let offset = 1; offset <= MAX_NEXT_ATTEMPTS; offset += 1) {
    const seed = (currentSeed + offset) >>> 0;
    const next = createCandidate(randomConfig({ seed }), generate);
    if (!samePalette(current.result, next.result)) return next;
  }
  throw new Error("Unable to generate a visually different palette.");
}

function samePalette(left: PaletteResult, right: PaletteResult): boolean {
  return sameColors(left.colors, right.colors) && sameColors(left.neutrals, right.neutrals);
}

function sameColors(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((color, index) => color === right[index]);
}

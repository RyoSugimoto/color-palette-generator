import { useEffect, useState } from "preact/hooks";

interface ExplorePanelProps {
  readonly seed: string;
  readonly onNext: () => void;
  readonly onSeed: (seed: string) => void;
  readonly onEdit: () => void;
}

export function ExplorePanel({ seed, onNext, onSeed, onEdit }: ExplorePanelProps) {
  const [draftSeed, setDraftSeed] = useState(seed);

  useEffect(() => setDraftSeed(seed), [seed]);

  return (
    <section class="panel" aria-labelledby="explore-heading">
      <div class="section-heading">
        <p class="eyebrow">Explore</p>
        <h2 id="explore-heading">Find a starting palette</h2>
        <p>Move through reproducible candidates, or load a seed directly.</p>
      </div>

      <div class="button-row">
        <button class="primary-button" type="button" onClick={onNext}>Next palette</button>
        <button type="button" onClick={onEdit}>Edit this palette</button>
      </div>

      <form
        class="field-group"
        onSubmit={(event) => {
          event.preventDefault();
          onSeed(draftSeed);
        }}
      >
        <label for="seed">Seed</label>
        <div class="inline-field">
          <input
            id="seed"
            value={draftSeed}
            onInput={(event) => setDraftSeed(event.currentTarget.value)}
            autocomplete="off"
            spellcheck={false}
          />
          <button type="submit">Load seed</button>
        </div>
        <p class="field-note">Current normalized seed: <code>{seed}</code></p>
      </form>

      <a class="text-link" href="#palette-preview">View palette</a>
    </section>
  );
}

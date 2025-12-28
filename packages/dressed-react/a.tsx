// TODO DO NOT MERGE

import { Suspense, use } from "react";
import { Button, render, Section } from "./src";

await render(
  <Section accessory={<Button url="hi" />}>
    Hi
    <Suspense fallback="...">
      <Deferred promise={new Promise((r) => setInterval(r, 500))} />
    </Suspense>
  </Section>,
  ([c]) => console.log(c),
);

function Deferred({ promise }: { promise: Promise<void> }) {
  use(promise);
  return "Bye";
}

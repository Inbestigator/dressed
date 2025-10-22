import type { ReactNode } from "react";
import { reconciler } from "../react/reconciler.ts";
import { createRenderer } from "../react/renderer.ts";

export async function render(children: ReactNode) {
  const container = createRenderer();
  const root = reconciler.createContainer(
    container,
    0,
    null,
    false,
    null,
    "dressed",
    (error: Error) => console.error(error),
    () => {},
    () => {},
    () => {},
    null,
  );

  if (root !== null) {
    await new Promise<void>((r) => reconciler.updateContainer(children, root, null, r));
    await container.render();
  }
  return container;
}

import type { ReactNode } from "react";
import { reconciler } from "../react/reconciler.ts";
import { createRenderer, type RendererCallback } from "../react/renderer.ts";

export async function render(children: ReactNode, callback?: RendererCallback) {
  const renderer = createRenderer(callback);
  const root = reconciler.createContainer(
    renderer,
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
    await renderer.render();
  }

  return renderer;
}

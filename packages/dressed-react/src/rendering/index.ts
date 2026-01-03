import type { ReactNode } from "react";
import { reconciler } from "../react/reconciler.ts";
import { createRenderer, type RendererCallback } from "../react/renderer.ts";

export function render(children: ReactNode, callback: RendererCallback) {
  const renderer = createRenderer(callback);

  const container = reconciler.createContainer(
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

  if (container !== null) reconciler.updateContainer(children, container);

  return { renderer, container };
}

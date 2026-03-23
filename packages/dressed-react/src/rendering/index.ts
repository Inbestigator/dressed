import { logger } from "dressed/utils";
import type { ReactNode } from "react";
import { reconciler } from "../react/reconciler.ts";
import { createRenderer, type RendererCallback } from "../react/renderer.ts";

/**
 * Renders a component tree.
 * @param children The components to render
 * @param callback A function called each time the React process updates the components
 */
export function render(children: ReactNode, callback: RendererCallback) {
  const renderer = createRenderer(callback);

  const container = reconciler.createContainer(
    renderer,
    0,
    null,
    false,
    null,
    "dressed",
    logger.error,
    () => {},
    () => {},
    () => {},
  );

  if (container !== null) reconciler.updateContainer(children, container);

  return { renderer, container };
}

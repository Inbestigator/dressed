import { logger } from "dressed/utils";
import type { ReactNode } from "react";
import { reconciler } from "../react/reconciler.ts";
import { createRenderer, type Renderer, type RendererCallback } from "../react/renderer.ts";

/**
 * Renders a component tree, React will continuously send updates as state changes.
 * If you just want to fire once and forget, use {@link renderFirstPaint}.
 * @param children The components to render
 * @param callback A function called each time the React process updates the components
 */
export function render(children: ReactNode, callback: RendererCallback) {
  const renderer = createRenderer(callback);
  const container = createContainer(renderer);

  if (container !== null) reconciler.updateContainer(children, container);

  return { renderer, container };
}

/**
 * Renders the inital component tree and doesn't listen to updates.
 * @param children The components to render
 * @returns The rendered tree
 */
export function renderFirstPaint(children: ReactNode) {
  let components: Parameters<RendererCallback>[0] = [];

  const renderer = createRenderer((v) => (components = v));
  const container = createContainer(renderer);

  if (container !== null) {
    reconciler.updateContainerSync(children, container);
    reconciler.flushSyncWork();

    renderer.render();

    reconciler.updateContainerSync(null, container);
    reconciler.flushSyncWork();
  }

  return components;
}

function createContainer(renderer: Renderer) {
  return reconciler.createContainer(
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
}

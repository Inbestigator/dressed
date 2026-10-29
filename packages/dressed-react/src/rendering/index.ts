import { logger } from "dressed/utils";
import type { ReactNode } from "react";
import { reconciler } from "../react/reconciler.ts";
import { createRenderer, type Renderer, type RendererCallback } from "../react/renderer.ts";

type OnErrorFn = Parameters<typeof reconciler.createContainer>[6];

/**
 * Renders a component tree, React will continuously send updates as state changes.
 * If you just want to fire once and forget, use {@link renderFirstPaint}.
 * @param children The components to render
 * @param callback A function called each time the React process updates the components
 */
export function render(children: ReactNode, callback: RendererCallback, onError: OnErrorFn = logger.error) {
  const renderer = createRenderer(callback);
  const container = createContainer(renderer, onError);

  if (container !== null) reconciler.updateContainer(children, container);

  return { renderer, container };
}

/**
 * Renders the inital component tree and doesn't listen to updates.
 * @param children The components to render
 * @returns The rendered tree
 */
export function renderFirstPaint(children: ReactNode, onError?: OnErrorFn) {
  let components: Parameters<RendererCallback>[0] = [];
  let uncaughtError: Error | undefined;

  const renderer = createRenderer((v) => (components = v));
  const container = createContainer(renderer, (e, i) => {
    uncaughtError ??= e;
    return onError?.(e, i);
  });

  if (container !== null) {
    reconciler.updateContainerSync(children, container);
    reconciler.flushSyncWork();

    renderer.render();

    reconciler.updateContainerSync(null, container);
    reconciler.flushSyncWork();
  }

  if (uncaughtError) throw uncaughtError;

  return components;
}

function createContainer(renderer: Renderer, onError: OnErrorFn) {
  return reconciler.createContainer(
    renderer,
    0,
    null,
    false,
    null,
    "dressed",
    onError,
    () => {},
    () => {},
    () => {},
  );
}

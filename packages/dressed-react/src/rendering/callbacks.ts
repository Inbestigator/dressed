import { type MessageComponentInteraction, type ModalSubmitInteraction, patchInteraction } from "./interaction.ts";

type Handler = ((i: MessageComponentInteraction) => unknown) | ((i: ModalSubmitInteraction) => unknown);

export const handlers = new Map<string, Handler>();

/** The pattern to export for handling `onClick`/`onSubmit` callbacks */
export const pattern = "@dressed/react-handler-:handlerId{-:fallback}";

/** Creates a function for handling callback interactions */
// biome-ignore lint/complexity/noBannedTypes: Need an empty record
export function setupCallbackHandler<T extends Record<string, Handler> = {}>(fallbacks: T = {} as T) {
  for (const key in fallbacks) handlers.set(key, fallbacks[key]);
  return Object.assign(
    async (
      interaction: MessageComponentInteraction | ModalSubmitInteraction,
      args: { handlerId: string; fallback?: string },
    ) => {
      const handler = handlers.get(args.handlerId) ?? handlers.get(args.fallback ?? "default");
      // @ts-expect-error
      interaction = interaction.$patched === Symbol.for("@dressed/react") ? interaction : patchInteraction(interaction);
      if (!handler) throw new Error("Unknown callback, try adding a default fallback handler");
      await handler(interaction as never);
      if (!interaction.history.length) interaction.deferUpdate();
    },
    {
      fallbacks: Object.fromEntries(Object.keys(fallbacks).map((k) => [k, k])) as {
        [K in keyof Omit<T, "default">]: K;
      },
    },
  );
}

export function registerHandler(handler: Handler, fallback?: string, id = randId()) {
  handlers.set(id, handler);
  const $handlerCleaner = setTimeout(() => handlers.delete(id), 6e4 * 30);
  const fbText = fallback ? `-${fallback}` : "";
  return { custom_id: `@dressed/react-handler-${id}${fbText}`, $registeredHandler: id, $handlerCleaner };
}

function randId(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join("");
}

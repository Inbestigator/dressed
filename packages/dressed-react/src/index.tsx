import type { ReactNode } from "react";
import {
  MessageFlags,
  type APIInteractionResponseCallbackData,
} from "discord-api-types/v10";
import { createRenderer } from "./react/renderer.ts";
import { reconciler } from "./react/reconciler.ts";
import { createInteraction, type RawFile } from "dressed/server";

type ReplyProps = [
  components: ReactNode,
  data?: Omit<APIInteractionResponseCallbackData, "content"> & {
    /** Whether the message is ephemeral */
    ephemeral?: boolean;
    /** The files to send with the message */
    files?: RawFile[];
    /** Whether to return the source message with the response */
    with_response?: boolean;
  },
];
type EditReplyProps = [
  components: ReactNode,
  data?: Omit<APIInteractionResponseCallbackData, "content"> & {
    /** The files to send with the message */
    files?: RawFile[];
  },
];
type FollowUpProps = [
  components: ReactNode,
  data?: Omit<APIInteractionResponseCallbackData, "content"> & {
    /** The files to send with the message */
    files?: RawFile[];
    /** Whether the message is ephemeral */
    ephemeral?: boolean;
  },
];

type ReactivatedInteraction<
  T extends NonNullable<ReturnType<typeof createInteraction>>,
> = OverrideMethodParams<
  T,
  {
    reply: ReplyProps;
    editReply: EditReplyProps;
    update: EditReplyProps;
    followUp: FollowUpProps;
  }
>;

type OverrideMethodParams<T, Overrides extends Record<string, unknown[]>> = {
  [K in keyof T]: K extends keyof Overrides
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T[K] extends (...args: any) => any
      ? (...args: Overrides[K]) => ReturnType<T[K]>
      : T[K]
    : T[K];
};

export async function render(component: ReactNode) {
  const container = createRenderer();
  const root = reconciler.createContainer(
    container,
    0,
    null,
    false,
    null,
    "dressed",
    (error: Error) => console.error(error),
    null,
  );

  if (root !== null) {
    await new Promise<void>((r) =>
      reconciler.updateContainer(component, root, null, r),
    );
    await container.render();
  }
  return container;
}

export function patchInteraction<
  T extends NonNullable<ReturnType<typeof createInteraction>>,
>(interaction: T): ReactivatedInteraction<T> {
  if (!interaction) throw new Error("No interaction");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newInteraction = interaction as any;
  for (const method of [
    "reply",
    "editReply",
    "update",
    "followUp",
  ] as (keyof T)[]) {
    if (!(method in interaction)) continue;
    const original = interaction[method] as (d: unknown) => unknown;
    newInteraction[method] = async (
      components: ReplyProps[0],
      data: ReplyProps[1] = {},
    ) => {
      const flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;
      data.flags = flags;
      data.components = (await render(components)).components as never;
      return original(data);
    };
  }
  return newInteraction as ReactivatedInteraction<T>;
}

export * from "./components/action-row.tsx";
export * from "./components/button.tsx";
export * from "./components/container.tsx";
export * from "./components/file.tsx";
export * from "./components/media-gallery.tsx";
export * from "./components/section.tsx";
export * from "./components/select-menu.tsx";
export * from "./components/separator.tsx";
export * from "./components/text-display.tsx";
export * from "./components/text-input.tsx";
export * from "./components/thumbnail.tsx";

import type { ReactNode } from "react";
import {
  MessageFlags,
  type APIInteractionResponseCallbackData,
  type APIMessageTopLevelComponent,
  type APIModalInteractionResponseCallbackData,
} from "discord-api-types/v10";
import { createRenderer } from "./react/renderer.ts";
import { reconciler } from "./react/reconciler.ts";
import type { createInteraction, RawFile } from "dressed/server";
import type {
  CommandInteraction as DressedCommandInteraction,
  MessageComponentInteraction as DressedMessageComponentInteraction,
  ModalSubmitInteraction as DressedModalSubmitInteraction,
} from "dressed";

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
type ShowModalProps = [
  components: ReactNode,
  data: Omit<APIModalInteractionResponseCallbackData, "components">,
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
    showModal: ShowModalProps;
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

export type CommandInteraction =
  ReactivatedInteraction<DressedCommandInteraction>;
export type MessageComponentInteraction =
  ReactivatedInteraction<DressedMessageComponentInteraction>;
export type ModalSubmitInteraction =
  ReactivatedInteraction<DressedModalSubmitInteraction>;

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

/**
 * Renders the provided children and returns a skeleton message object with the `IsComponentsV2` flag
 * @example
 * createMessage(channelId, await renderMessage(<Button label="Hello world" />))
 */
export async function renderMessage(children: ReactNode) {
  return {
    flags: MessageFlags.IsComponentsV2,
    components: (await render(children))
      .components as APIMessageTopLevelComponent[],
  };
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
    "showModal",
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
  return newInteraction;
}

export { ActionRow } from "./components/action-row.ts";
export { Button } from "./components/button.ts";
export { Container } from "./components/container.ts";
export { File } from "./components/file.ts";
export { MediaGallery, MediaGalleryItem } from "./components/media-gallery.ts";
export { Section } from "./components/section.ts";
export { SelectMenu, SelectMenuOption } from "./components/select-menu.ts";
export { Separator } from "./components/separator.ts";
export { TextDisplay } from "./components/text-display.ts";
export { TextInput } from "./components/text-input.ts";
export { Thumbnail } from "./components/thumbnail.ts";

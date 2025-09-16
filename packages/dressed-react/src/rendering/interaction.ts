import {
  type APIInteractionResponseCallbackData,
  type APIModalInteractionResponseCallbackData,
  type ApplicationCommandType,
  MessageFlags,
} from "discord-api-types/v10";
import type {
  CommandInteraction as DressedCommandInteraction,
  MessageComponentInteraction as DressedMessageComponentInteraction,
  ModalSubmitInteraction as DressedModalSubmitInteraction,
} from "dressed";
import type { createInteraction, RawFile } from "dressed/server";
import type { ReactNode } from "react";
import { render } from "./index.ts";

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
type ShowModalProps = [components: ReactNode, data: Omit<APIModalInteractionResponseCallbackData, "components">];

type ReactivatedInteraction<T> = OverrideMethodParams<
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
    ? // biome-ignore lint/suspicious/noExplicitAny: We're overriding the types
      T[K] extends (...args: any) => any
      ? (...args: Overrides[K]) => ReturnType<T[K]>
      : T[K]
    : T[K];
};

export type CommandInteraction<T extends keyof typeof ApplicationCommandType = "ChatInput"> = ReactivatedInteraction<
  DressedCommandInteraction<T>
>;
export type MessageComponentInteraction = ReactivatedInteraction<DressedMessageComponentInteraction>;
export type ModalSubmitInteraction = ReactivatedInteraction<DressedModalSubmitInteraction>;

export function patchInteraction<T extends NonNullable<ReturnType<typeof createInteraction>>>(
  interaction: T,
): ReactivatedInteraction<T> {
  if (!interaction) throw new Error("No interaction");
  // biome-ignore lint/suspicious/noExplicitAny: We're overriding the types
  const newInteraction = interaction as any;
  for (const method of ["reply", "editReply", "update", "followUp", "showModal"] as (keyof T)[]) {
    if (!(method in interaction)) continue;
    const original = interaction[method] as (d: unknown) => unknown;
    newInteraction[method] = async (components: ReplyProps[0], data: ReplyProps[1] = {}) => {
      const flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;
      data.flags = flags;
      data.components = (await render(components)).components as never;
      return original(data);
    };
  }
  return newInteraction;
}

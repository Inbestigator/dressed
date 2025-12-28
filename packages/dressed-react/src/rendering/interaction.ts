import {
  type APIInteractionResponseCallbackData,
  type APIMessageTopLevelComponent,
  type APIModalInteractionResponseCallbackData,
  type ApplicationCommandType,
  MessageFlags,
} from "discord-api-types/v10";
import type {
  CommandConfig,
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

// I wish there's a better way to make it just automatically recognize the generic constraints from the original types
export type CommandInteraction<T extends keyof typeof ApplicationCommandType | CommandConfig = "ChatInput"> =
  ReactivatedInteraction<DressedCommandInteraction<T>>;
export type MessageComponentInteraction<
  T extends
    | "Button"
    | "StringSelect"
    | "UserSelect"
    | "RoleSelect"
    | "MentionableSelect"
    | "ChannelSelect"
    | undefined = undefined,
> = ReactivatedInteraction<DressedMessageComponentInteraction<T>>;
export type ModalSubmitInteraction = ReactivatedInteraction<DressedModalSubmitInteraction>;

export function patchInteraction<T extends NonNullable<ReturnType<typeof createInteraction>>>(
  interaction: T,
): ReactivatedInteraction<T> {
  if (!interaction) throw new Error("No interaction");
  // biome-ignore lint/suspicious/noExplicitAny: We're overriding the types
  const newInteraction = interaction as any;
  // @ts-expect-error
  const editReply = interaction.editReply;
  for (const method of ["reply", "editReply", "update", "followUp", "showModal"] as (keyof T)[]) {
    if (!(method in interaction)) continue;

    const original = interaction[method] as (d: unknown) => unknown;

    newInteraction[method] = (components: ReplyProps[0], data: ReplyProps[1] = {}) => {
      data.flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;

      const { promise, resolve } = Promise.withResolvers();

      render(components, (c) => {
        data.components = c as APIMessageTopLevelComponent[];
        if (interaction.history.some((h) => ["reply", "deferReply", "update", "deferUpdate"].includes(h))) {
          return editReply(data);
        }
        resolve(original(data));
      });

      return promise;
    };
  }
  return newInteraction;
}

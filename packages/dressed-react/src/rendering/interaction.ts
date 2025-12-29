import { type ApplicationCommandType, MessageFlags } from "discord-api-types/v10";
import {
  type CommandConfig,
  type CommandInteraction as DressedCommandInteraction,
  type MessageComponentInteraction as DressedMessageComponentInteraction,
  type ModalSubmitInteraction as DressedModalSubmitInteraction,
  editWebhookMessage,
} from "dressed";
import type { createInteraction } from "dressed/server";
import type { ReactNode } from "react";
import { render } from "./index.ts";

type ReactivatedInteraction<T> = OverrideMethodParams<
  T,
  {
    [K in "reply" | "editReply" | "update" | "followUp" | "showModal"]: [
      components: ReactNode,
      // @ts-expect-error
      ...(Parameters<T[K]> extends readonly [...infer P]
        ? [data?: Omit<Exclude<P[0], string>, "content" | "components">, $req?: P[1]]
        : never),
    ];
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

    newInteraction[method] = (...[components, data = {}, $req]: Parameters<CommandInteraction["reply"]>) => {
      data.flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;

      return new Promise((resolve) => {
        let followUpId: string;
        render(components, async (c) => {
          // @ts-expect-error
          data.components = c;
          if (followUpId) {
            return editWebhookMessage(interaction.application_id, interaction.token, followUpId, data, undefined, $req);
          }
          const shouldEdit = (method === "reply" || method === "update") && interaction.history.includes(method);
          const res = await (shouldEdit ? editReply : original)(data, $req);
          if (method === "followUp") followUpId = res.id;
          resolve(res);
        });
      });
    };
  }
  return newInteraction;
}

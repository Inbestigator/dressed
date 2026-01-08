import { type ApplicationCommandType, MessageFlags } from "discord-api-types/v10";
import {
  type CommandConfig,
  type CommandInteraction as DressedCommandInteraction,
  type MessageComponentInteraction as DressedMessageComponentInteraction,
  type ModalSubmitInteraction as DressedModalSubmitInteraction,
  editWebhookMessage,
} from "dressed";
import type { createInteraction } from "dressed/server";
import { type ComponentType, createElement, type PropsWithChildren, type ReactNode } from "react";
import { reconciler } from "../react/reconciler.ts";
import { render } from "./index.ts";
import type { WithContainer } from "./message.ts";

type ReactivatedInteraction<T> = OverrideMethodParams<
  T,
  {
    [K in "reply" | "editReply" | "update" | "followUp" | "showModal"]: [
      components: ReactNode,
      // @ts-expect-error
      ...(Parameters<T[K]> extends readonly [...infer P]
        ? [
            data?: Omit<Exclude<P[0], string>, "content" | "components">,
            $req?: P[1] & {
              /**
               * Do not set the contents of your response to `null` after 15 minutes (when Discord deletes the original interaction) in order to conserve resources.
               *
               * Setting the response to `null` will not affect the shown components, it just destroys existing hooks and other internal data.
               *
               * @default false
               */
              persistContainer?: boolean;
            },
          ]
        : never),
    ];
  }
> & {
  $patched: symbol;
};

type OverrideMethodParams<T, Overrides extends Record<string, unknown[]>> = {
  [K in keyof T]: K extends keyof Overrides
    ? T[K] extends (...args: never[]) => unknown
      ? (...args: Overrides[K]) => Promise<WithContainer<NonNullable<Awaited<ReturnType<T[K]>>>>>
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

/**
 * Override interaction methods to accept React components
 * @param parent A global parent that will be placed at the tree root, can be used for providers
 */
export function patchInteraction<T extends NonNullable<ReturnType<typeof createInteraction>>>(
  interaction: T,
  parent?: ComponentType<PropsWithChildren>,
): ReactivatedInteraction<T> {
  const createdAt = Date.now();
  if (!interaction) throw new Error("No interaction");
  // biome-ignore lint/suspicious/noExplicitAny: We're overriding the types
  const newInteraction = { $patched: Symbol.for("@dressed/react"), ...interaction } as any;
  // @ts-expect-error
  const editReply = interaction.editReply;
  for (const method of ["reply", "editReply", "update", "followUp", "showModal"] as (keyof T)[]) {
    if (!(method in interaction)) continue;

    const original = interaction[method] as (d: unknown) => unknown;

    newInteraction[method] = (...[components, data = {}, $req]: Parameters<CommandInteraction["reply"]>) => {
      data.flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;

      let followUpId: string | 0 | undefined;
      let pendingFollowUpEdit = false;

      function editFollowUp() {
        if (!followUpId) return;
        return editWebhookMessage(interaction.application_id, interaction.token, followUpId, data, undefined, $req);
      }

      return new Promise((resolve) => {
        const { container } = render(parent ? createElement(parent, null, components) : components, async (c) => {
          if (c.length === 0 || Date.now() > createdAt + 6e4 * 15) return;
          // @ts-expect-error
          data.components = c;
          if (followUpId) return editFollowUp();
          if (followUpId === 0) {
            pendingFollowUpEdit = true;
            return;
          }
          if (method === "followUp") followUpId = 0;
          const shouldEdit = (method === "reply" || method === "update") && interaction.history.includes(method);
          const res = await (shouldEdit ? editReply : original)(data, $req);
          if (method === "followUp") {
            followUpId = res.id;
            if (pendingFollowUpEdit) editFollowUp();
          }
          resolve(Object.assign(res ?? {}, { $container: container }));
        });
        if (!$req?.persistContainer) {
          setTimeout(() => reconciler.updateContainer(null, container), createdAt + 6e4 * 15 - Date.now()).unref();
        }
      });
    };
  }
  return newInteraction;
}

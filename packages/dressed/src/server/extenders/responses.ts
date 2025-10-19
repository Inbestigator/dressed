import {
  type APIInteraction,
  type APIInteractionResponseCallbackData,
  type APIUser,
  MessageFlags,
} from "discord-api-types/v10";
import { editWebhookMessage, executeWebhook } from "../../resources/generated.resources.ts";
import { createInteractionCallback } from "../../resources/interactions.ts";
import type { RawFile } from "../../types/file.ts";
import type { BaseInteractionMethods } from "../../types/interaction.ts";
import { botEnv } from "../../utils/env.ts";

export function baseInteractionMethods(interaction: APIInteraction): BaseInteractionMethods {
  const history: BaseInteractionMethods["history"] = [];
  return {
    reply(data) {
      history.push("reply");
      if (typeof data === "string") {
        data = { content: data } as Extract<Parameters<BaseInteractionMethods["reply"]>[0], { content: string }>;
      }
      if (data.ephemeral) {
        data.flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
      }
      const { files, ...rest } = data;
      return createInteractionCallback(interaction.id, interaction.token, "ChannelMessageWithSource", rest, files, {
        with_response: data?.with_response,
      }) as never;
    },
    deferReply(data) {
      history.push("deferReply");
      if (data?.ephemeral) {
        data.flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
      }
      return createInteractionCallback(
        interaction.id,
        interaction.token,
        "DeferredChannelMessageWithSource",
        data,
        undefined,
        { with_response: data?.with_response },
      ) as never;
    },
    update(data) {
      history.push("update");
      if (typeof data === "string") {
        data = { content: data } as Extract<Parameters<BaseInteractionMethods["update"]>[0], { content: string }>;
      }
      const { files, ...rest } = data;
      return createInteractionCallback(interaction.id, interaction.token, "UpdateMessage", rest, files, {
        with_response: data.with_response,
      }) as never;
    },
    deferUpdate(options) {
      history.push("deferUpdate");
      return createInteractionCallback(
        interaction.id,
        interaction.token,
        "DeferredMessageUpdate",
        undefined,
        undefined,
        options,
      );
    },
    editReply(data) {
      history.push("editReply");
      return editWebhookMessage(botEnv.DISCORD_APP_ID, interaction.token, "@original", data);
    },
    followUp(
      data:
        | string
        | (APIInteractionResponseCallbackData & {
            files?: RawFile[];
            ephemeral?: boolean;
          }),
    ) {
      history.push("followUp");
      if (typeof data === "object" && data.ephemeral) {
        data.flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
      }
      return executeWebhook(botEnv.DISCORD_APP_ID, interaction.token, data, {
        wait: true,
      });
    },
    showModal(data, options) {
      history.push("showModal");
      return createInteractionCallback(interaction.id, interaction.token, "Modal", data, undefined, options);
    },
    sendChoices(choices, options) {
      history.push("sendChoices");
      return createInteractionCallback(
        interaction.id,
        interaction.token,
        "ApplicationCommandAutocompleteResult",
        { choices },
        undefined,
        options,
      );
    },
    user: interaction.user ?? (interaction.member?.user as APIUser),
    history,
  };
}

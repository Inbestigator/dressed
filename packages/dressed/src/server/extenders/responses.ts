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
    reply(data, $req) {
      history.push("reply");
      if (typeof data === "string") {
        data = { content: data } as Extract<Parameters<BaseInteractionMethods["reply"]>[0], { content: string }>;
      }
      if (data.ephemeral) {
        data.flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
      }
      const { files, ...rest } = data;
      return createInteractionCallback(
        interaction.id,
        interaction.token,
        "ChannelMessageWithSource",
        rest,
        files,
        {
          with_response: data?.with_response,
        },
        $req,
      ) as never;
    },
    deferReply(data, $req) {
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
        $req,
      ) as never;
    },
    update(data, $req) {
      history.push("update");
      if (typeof data === "string") {
        data = { content: data } as Extract<Parameters<BaseInteractionMethods["update"]>[0], { content: string }>;
      }
      const { files, ...rest } = data;
      return createInteractionCallback(
        interaction.id,
        interaction.token,
        "UpdateMessage",
        rest,
        files,
        {
          with_response: data.with_response,
        },
        $req,
      ) as never;
    },
    deferUpdate(params, $req) {
      history.push("deferUpdate");
      return createInteractionCallback(
        interaction.id,
        interaction.token,
        "DeferredMessageUpdate",
        undefined,
        undefined,
        params,
        $req,
      );
    },
    editReply(data, $req) {
      history.push("editReply");
      return editWebhookMessage(botEnv.DISCORD_APP_ID, interaction.token, "@original", data, undefined, $req);
    },
    followUp(
      data:
        | string
        | (APIInteractionResponseCallbackData & {
            files?: RawFile[];
            ephemeral?: boolean;
          }),
      $req,
    ) {
      history.push("followUp");
      if (typeof data === "object" && data.ephemeral) {
        data.flags = (data.flags ?? 0) | MessageFlags.Ephemeral;
      }
      return executeWebhook(
        botEnv.DISCORD_APP_ID,
        interaction.token,
        data,
        {
          wait: true,
        },
        $req,
      );
    },
    showModal(data, params, $req) {
      history.push("showModal");
      return createInteractionCallback(interaction.id, interaction.token, "Modal", data, undefined, params, $req);
    },
    sendChoices(choices, params, $req) {
      history.push("sendChoices");
      return createInteractionCallback(
        interaction.id,
        interaction.token,
        "ApplicationCommandAutocompleteResult",
        { choices },
        undefined,
        params,
        $req,
      );
    },
    user: interaction.user ?? (interaction.member?.user as APIUser),
    history,
  };
}

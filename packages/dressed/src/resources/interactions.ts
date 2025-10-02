import type { APIInteractionResponse, RESTPostAPIInteractionCallbackQuery, Snowflake } from "discord-api-types/v10";
import { InteractionResponseType, Routes } from "discord-api-types/v10";
import type { RawFile } from "../types/file.ts";
import type { InteractionCallbackResponse } from "../types/interaction.ts";
import { type CallConfig, callDiscord } from "../utils/call-discord.ts";

/**
 * Respond to an interaction by sending a modal, message, or update the original.
 * @param interactionId The ID of the interaction to callback
 * @param interactionToken The token of the interaction to callback
 * @param type The type of response
 * @param data The data to use, the respective modal, message data etc.
 * @param files Files used in messages
 * @param options Optional parameters for the request
 */
export async function createInteractionCallback<
  T extends keyof typeof InteractionResponseType,
  P extends RESTPostAPIInteractionCallbackQuery,
  E extends object = Extract<APIInteractionResponse, { type: (typeof InteractionResponseType)[T] }>,
>(
  interactionId: Snowflake,
  interactionToken: string,
  type: T,
  ...[data, files, params, $req]: E extends {
    data?: infer D;
  }
    ? // This accounts for the different types submitting data or not
      [...(E extends { data: object } ? [D] : [D?]), RawFile[]?, P?, CallConfig?]
    : [undefined?, undefined?, P?, CallConfig?]
): InteractionCallbackResponse<P> {
  const res = await callDiscord(
    Routes.interactionCallback(interactionId, interactionToken),
    {
      method: "POST",
      body: {
        type: InteractionResponseType[type],
        data,
      },
      params,
      files,
    },
    $req,
  );

  return params?.with_response ? res.json() : (null as never);
}

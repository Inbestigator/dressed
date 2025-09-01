import type {
  APIInteractionResponse,
  RESTPostAPIInteractionCallbackQuery,
} from "discord-api-types/v10";
import { InteractionResponseType, Routes } from "discord-api-types/v10";
import { callDiscord } from "../utils/call-discord.ts";
import type { RawFile } from "../types/file.ts";
import type { InteractionCallbackResponse } from "../types/interaction.ts";

/**
 * Returns an invite object for the given code.
 * @param interactionId The ID of the interaction to callback
 * @param interactionId The token of the interaction to callback
 * @param options Optional parameters for the request
 */
export async function createInteractionCallback<
  T extends keyof typeof InteractionResponseType,
  Q extends RESTPostAPIInteractionCallbackQuery,
  E extends object = Extract<
    APIInteractionResponse,
    { type: (typeof InteractionResponseType)[T] }
  >,
>(
  interactionId: string,
  interactionToken: string,
  type: T,
  // This accounts for the different types submitting data or not
  ...[data, files, options]: E extends {
    data?: infer D;
  }
    ? [...(E extends { data: object } ? [D] : [D?]), RawFile[]?, Q?]
    : [undefined?, RawFile[]?, Q?]
): InteractionCallbackResponse<Q> {
  const res = await callDiscord(
    Routes.interactionCallback(interactionId, interactionToken),
    {
      method: "POST",
      body: {
        type: InteractionResponseType[type],
        data,
      },
      params: options,
      files,
    },
  );

  return options?.with_response ? res.json() : (null as never);
}

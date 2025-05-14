import type {
  RESTGetAPIPollAnswerVotersQuery,
  RESTGetAPIPollAnswerVotersResult,
  RESTPostAPIPollExpireResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../utils.ts";

/**
 * Get a list of users that voted for this specific answer.
 * @param channel The channel to get the message from
 * @param message The message to get the poll from
 * @param answer The answer to get the voters from
 * @param options Optional parameters for the request
 */
export async function listAnswerVoters(
  channel: Snowflake,
  message: Snowflake,
  answer: number,
  options?: RESTGetAPIPollAnswerVotersQuery,
): Promise<RESTGetAPIPollAnswerVotersResult> {
  const res = await callDiscord(
    Routes.pollAnswerVoters(channel, message, answer),
    {
      method: "GET",
      params: options as Record<string, unknown>,
    },
  );

  return res.json();
}

/**
 * Immediately ends the poll. You cannot end polls from other users.
 * @param channel The channel to get the message from
 * @param message The message containing the poll
 */
export async function endPoll(
  channel: Snowflake,
  message: Snowflake,
): Promise<RESTPostAPIPollExpireResult> {
  const res = await callDiscord(Routes.expirePoll(channel, message), {
    method: "POST",
  });

  return res.json();
}

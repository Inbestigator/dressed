import type {
  APIMessage,
  RESTGetAPIPollAnswerVotersResult,
  Snowflake,
} from "discord-api-types/v10";
import { RouteBases, Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Get a list of users that voted for this specific answer.
 * @param channel The channel to get the message from
 * @param message The message to get the poll from
 * @param answer The answer to get the voters from
 * @param options Query parameters for filtering the voters
 */
export async function listAnswerVoters(
  channel: Snowflake,
  message: Snowflake,
  answer: number,
  options?: {
    /** Get users after this user ID */
    after?: Snowflake;
    /** The maximum number of users to return */
    limit?: number;
  },
): Promise<RESTGetAPIPollAnswerVotersResult> {
  const url = new URL(
    Routes.pollAnswerVoters(channel, message, answer),
    RouteBases.api,
  );

  if (options?.after) url.searchParams.append("after", options.after);
  if (options?.limit) {
    url.searchParams.append("limit", options.limit.toString());
  }

  const res = await callDiscord(
    url.toString(),
    {
      method: "GET",
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
): Promise<APIMessage> {
  const res = await callDiscord(
    Routes.expirePoll(channel, message),
    {
      method: "POST",
    },
  );

  return res.json();
}

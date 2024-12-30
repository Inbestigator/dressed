import {
  type RESTGetAPIUserResult,
  Routes,
  type Snowflake,
} from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Returns a user object for a given user ID.
 * @param user The user to fetch (defaults to self)
 */
export async function getUser(user?: Snowflake): Promise<RESTGetAPIUserResult> {
  const res = await callDiscord(Routes.user(user), {
    method: "GET",
  });

  return res.json();
}

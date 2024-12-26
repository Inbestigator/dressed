import { type APIUser, Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Returns a user object for a given user ID.
 * @param user The user to fetch (defaults to self)
 */
export async function getUser(user?: string): Promise<APIUser> {
  const res = await callDiscord(Routes.user(user), {
    method: "GET",
  });

  return res.json();
}

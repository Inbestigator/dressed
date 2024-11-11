import { DiscordRequest } from "./utils.ts";

export default async function getDetails() {
  const details = await DiscordRequest("users/@me", { method: "GET" });

  return await details.json();
}

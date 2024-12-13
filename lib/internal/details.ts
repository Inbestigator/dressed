import { callDiscord } from "./utils.ts";

export default async function getDetails() {
  const details = await callDiscord("users/@me", { method: "GET" });

  return await details.json();
}

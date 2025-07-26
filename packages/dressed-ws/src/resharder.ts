import { listGuilds } from "dressed";
import type { ConnectionActions } from "./gateway.ts";
import { createCache } from "./cache/index.ts";

export function startAutoSharder(
  connection: ConnectionActions,
  threshold = 0.9,
  disableCache?: boolean,
) {
  const guildCache = disableCache
    ? { listGuilds }
    : createCache({ listGuilds });

  async function checkReshard() {
    try {
      const guilds = await guildCache.listGuilds();
      const ratio = guilds.length / 2500;
      const next = Math.ceil(ratio);
      const delta = next - ratio;

      if (delta < 1 - threshold || delta > threshold) {
        connection.shards.reshard(next);
      }
    } catch (e) {
      console.error("Failed to auto-reshard:", e);
    }
  }

  connection.onGuildCreate(checkReshard);
  connection.onGuildDelete(checkReshard);
}

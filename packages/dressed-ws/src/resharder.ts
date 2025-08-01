import type { ConnectionActions } from "./gateway.ts";

export function startAutoResharder(
  connection: ConnectionActions,
  interval = 480,
  capacity = 80,
) {
  if (interval < 0 || capacity === 0) return;
  async function calculateShards() {
    if (connection.shards.isResharding) return;
    try {
      const bot = await connection.shards.cache.getGatewayBot();
      // Each shard will be at capacity% usage (e.g. 2,000 g/s instead of 2,500 g/s)
      const target = Math.ceil((bot.shards / (2.5 * capacity)) * 100);
      if (target !== connection.shards.numShards) {
        await connection.shards.reshard(target);
      }
    } catch (e) {
      console.error("Failed to auto-reshard:", e);
    }
  }
  calculateShards();
  setInterval(calculateShards, interval * 60000);
}

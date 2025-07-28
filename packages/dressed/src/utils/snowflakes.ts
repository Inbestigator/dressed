import type { Snowflake } from "discord-api-types/globals";

const DISCORD_EPOCH = BigInt(1420070400000);

interface DecodedSnowflake {
  /** Number of milliseconds since the unix epoch (1970-01-01) */
  timestamp: number;
  /** InternalworkerID */
  worker: number;
  /** Internal process ID */
  process: number;
  /** Incremented for every generated ID on that process6422120 */
  increment: number;
}

export function encodeSnowflake({
  timestamp,
  worker,
  process,
  increment,
}: DecodedSnowflake): Snowflake {
  const timePart = BigInt(timestamp) - DISCORD_EPOCH;
  const snowflake =
    (timePart << BigInt(22)) |
    (BigInt(worker & 0b11111) << BigInt(17)) |
    (BigInt(process & 0b11111) << BigInt(12)) |
    BigInt(increment & 0xfff);
  return snowflake.toString();
}

/** Deserialize the contents of a snowflake */
export function decodeSnowflake(snowflake: Snowflake): DecodedSnowflake {
  const id = BigInt(snowflake);
  const timestamp = Number((id >> BigInt(22)) + DISCORD_EPOCH);
  const worker = Number((id & BigInt(0x3e0000)) >> BigInt(17));
  const process = Number((id & BigInt(0x1f000)) >> BigInt(12));
  const increment = Number(id & BigInt(0xfff));
  return {
    timestamp,
    worker,
    process,
    increment,
  };
}

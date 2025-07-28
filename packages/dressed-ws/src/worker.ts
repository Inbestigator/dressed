import {
  GatewayOpcodes,
  type APIGatewayBotInfo,
  type GatewayIdentifyData,
  type GatewayReceivePayload,
} from "discord-api-types/v10";
import { platform } from "node:process";

interface ShardState {
  ws: WebSocket;
  heartbeatInterval: NodeJS.Timeout;
}

const shards = new Map<string, ShardState>();

type WorkerMsg =
  | {
      type: "addShard";
      config: GatewayIdentifyData & {
        intents: number;
        shard: [number, number];
        bot: APIGatewayBotInfo;
      };
    }
  | {
      type: "removeShard";
      shardId: string;
    }
  | {
      type: "emit";
      op: keyof typeof GatewayOpcodes;
      d: unknown;
    };

self.onmessage = ({ data }: MessageEvent<WorkerMsg>) => {
  switch (data.type) {
    case "addShard": {
      const { config } = data;
      const shardId = config.shard.toString();
      const ws = new WebSocket(config.bot.url);
      let seq: number | null = null;

      function beat() {
        ws.send(JSON.stringify({ op: GatewayOpcodes.Heartbeat, d: seq }));
      }

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            op: GatewayOpcodes.Identify,
            d: {
              ...config,
              properties: {
                os: platform,
                browser: "Dressed",
                device: "Dressed",
              },
            },
          }),
        );
      };

      ws.onmessage = (e) => {
        const payload = JSON.parse(e.data) as GatewayReceivePayload;
        if (payload.s !== null) seq = payload.s;

        switch (payload.op) {
          case GatewayOpcodes.Hello: {
            const interval = setInterval(beat, payload.d.heartbeat_interval);
            shards.set(shardId, { ws, heartbeatInterval: interval });
            break;
          }
          case GatewayOpcodes.Dispatch: {
            postMessage({
              type: "dispatch",
              shard: config.shard,
              ...payload,
            });
            break;
          }
          case GatewayOpcodes.Heartbeat: {
            beat();
            break;
          }
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error (shard", shardId, ")", err);
      };

      ws.onclose = () => {
        const shard = shards.get(shardId);
        if (shard) clearInterval(shard.heartbeatInterval);
        shards.delete(shardId);
      };
      break;
    }
    case "removeShard": {
      const shard = shards.get(data.shardId);
      if (shard) {
        clearInterval(shard.heartbeatInterval);
        shard.ws.close(1000, "Shard removed");
        shards.delete(data.shardId);
      }
      break;
    }
    case "emit": {
      for (const { ws } of shards.values()) {
        ws.send(JSON.stringify({ op: GatewayOpcodes[data.op], d: data.d }));
      }
      break;
    }
  }
};

self.onclose = () => {
  for (const { ws, heartbeatInterval } of shards.values()) {
    clearInterval(heartbeatInterval);
    ws.close(1000, "Worker closed");
  }
  shards.clear();
};

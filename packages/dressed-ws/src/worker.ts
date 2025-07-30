import {
  GatewayOpcodes,
  GatewayCloseCodes,
  type APIGatewayBotInfo,
  type GatewayIdentifyData,
  type GatewayReceivePayload,
  GatewayDispatchEvents,
  type GatewayReadyDispatchData,
} from "discord-api-types/v10";
import assert from "node:assert";
import { platform } from "node:process";
import { parentPort } from "node:worker_threads";

assert(parentPort);

interface ShardState {
  ws: WebSocket;
  heartbeatInterval: NodeJS.Timeout;
  resuming?: Pick<
    GatewayReadyDispatchData,
    "resume_gateway_url" | "session_id"
  >;
}

interface ShardConfig extends GatewayIdentifyData {
  intents: number;
  shard: [number, number];
  bot: APIGatewayBotInfo;
}

const shards = new Map<string, ShardState>();
const reconnectableCodes = [
  GatewayCloseCodes.UnknownError,
  GatewayCloseCodes.UnknownOpcode,
  GatewayCloseCodes.DecodeError,
  GatewayCloseCodes.NotAuthenticated,
  GatewayCloseCodes.AlreadyAuthenticated,
  GatewayCloseCodes.InvalidSeq,
  GatewayCloseCodes.RateLimited,
  GatewayCloseCodes.SessionTimedOut,
];

type WorkerMsg =
  | {
      type: "addShard";
      config: ShardConfig;
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

function connectShard(
  url: string,
  config: ShardConfig,
  resume?: { sessionId: string; seq: number },
) {
  const ws = new WebSocket(url);
  const shardId = config.shard.toString();
  let seq: number | null = null;

  function beat() {
    ws.send(JSON.stringify({ op: GatewayOpcodes.Heartbeat, d: seq }));
  }

  ws.onopen = () => {
    ws.send(
      JSON.stringify(
        resume
          ? {
              op: GatewayOpcodes.Resume,
              d: {
                session_id: resume.sessionId,
                seq: resume.seq,
                token: config.token,
              },
            }
          : {
              op: GatewayOpcodes.Identify,
              d: {
                ...config,
                properties: {
                  os: platform,
                  browser: "Dressed",
                  device: "Dressed",
                },
              },
            },
      ),
    );
  };

  ws.onmessage = (e) => {
    assert(parentPort);
    const payload = JSON.parse(e.data) as GatewayReceivePayload;
    if (payload.s !== null) seq = payload.s;

    switch (payload.op) {
      case GatewayOpcodes.Hello: {
        const interval = setInterval(beat, payload.d.heartbeat_interval);
        shards.set(shardId, {
          ws,
          heartbeatInterval: interval,
        });
        break;
      }
      case GatewayOpcodes.InvalidSession:
      case GatewayOpcodes.Reconnect: {
        const shard = shards.get(shardId);
        if (shard) {
          clearInterval(shard.heartbeatInterval);
          shard.ws.close(3000, "Reconnect message received");
          if (shard.resuming && seq) {
            connectShard(shard.resuming.resume_gateway_url, config, {
              seq,
              sessionId: shard.resuming.session_id,
            });
          }
        }
        break;
      }
      case GatewayOpcodes.Dispatch: {
        if (payload.t === GatewayDispatchEvents.Ready) {
          shards.set(shardId, {
            ...shards.get(shardId)!,
            resuming: {
              resume_gateway_url: payload.d.resume_gateway_url,
              session_id: payload.d.session_id,
            },
          });
        }
        parentPort.postMessage({
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

  ws.onerror = (e) => {
    console.error(`WebSocket error (shard ${config.shard[0]})`, e);
  };

  ws.onclose = ({ code }) => {
    const shard = shards.get(shardId);
    if (shard) {
      clearInterval(shard.heartbeatInterval);
      if (
        shard.resuming &&
        (reconnectableCodes.includes(code) ||
          (!Object.values(GatewayCloseCodes).includes(code) &&
            code !== 3000)) &&
        seq
      ) {
        connectShard(shard.resuming.resume_gateway_url, config, {
          seq,
          sessionId: shard.resuming.session_id,
        });
      } else {
        shards.delete(shardId);
        console.log(
          `Connection closed with code ${code} (shard ${config.shard[0]})`,
        );
      }
    }
  };
}

parentPort.on("message", (data: WorkerMsg) => {
  switch (data.type) {
    case "addShard": {
      connectShard(data.config.bot.url, data.config);
      break;
    }
    case "removeShard": {
      const shard = shards.get(data.shardId);
      if (shard) {
        clearInterval(shard.heartbeatInterval);
        shard.ws.close(3000, "Shard removed");
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
});

parentPort.on("close", () => {
  for (const { ws, heartbeatInterval } of shards.values()) {
    clearInterval(heartbeatInterval);
    ws.close(3000, "Worker closed");
  }
  shards.clear();
});

import {
  GatewayOpcodes,
  GatewayCloseCodes,
  type APIGatewayBotInfo,
  type GatewayIdentifyData,
  type GatewayReceivePayload,
  GatewayDispatchEvents,
} from "discord-api-types/v10";
import assert from "node:assert";
import { platform } from "node:process";
import { parentPort } from "node:worker_threads";

assert(parentPort);

interface ShardState {
  ws: WebSocket;
  heartbeatInterval: NodeJS.Timeout;
}

interface ShardConfig extends GatewayIdentifyData {
  intents: number;
  shard: [number, number];
  bot: APIGatewayBotInfo;
}

const shards = new Map<string, ShardState>();

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

const WSCodes = {
  Disconnect: 1000,
  NewSession: 1001,
  ResumeSession: 3001,
} as const;

function connectShard(
  url: string,
  config: ShardConfig,
  resume?: { sessionId: string; seq: number },
) {
  const ws = new WebSocket(url);
  const shardId = config.shard.toString();
  let seq = resume?.seq ?? null;
  let resumeData = resume && {
    resume_gateway_url: url,
    session_id: resume.sessionId,
  };
  let beatAcked = true;

  function beat() {
    if (!beatAcked) {
      ws.close(WSCodes.ResumeSession, "Failed to ack heartbeat");
      return;
    }
    beatAcked = false;
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

    switch (payload.op) {
      case GatewayOpcodes.Hello: {
        setTimeout(() => {
          beat();
          const interval = setInterval(beat, payload.d.heartbeat_interval);
          shards.set(shardId, {
            ws,
            heartbeatInterval: interval,
          });
        }, payload.d.heartbeat_interval * Math.random());
        break;
      }
      case GatewayOpcodes.InvalidSession:
      case GatewayOpcodes.Reconnect: {
        const shard = shards.get(shardId);
        if (shard) {
          clearInterval(shard.heartbeatInterval);
          if (
            payload.op === GatewayOpcodes.InvalidSession &&
            payload.d === false
          ) {
            shard.ws.close(WSCodes.NewSession, "Initiating full reset");
          } else {
            shard.ws.close(WSCodes.ResumeSession, "Reconnect message received");
          }
        }
        break;
      }
      case GatewayOpcodes.Dispatch: {
        seq = payload.s;
        if (payload.t === GatewayDispatchEvents.Ready) {
          resumeData = {
            resume_gateway_url: payload.d.resume_gateway_url,
            session_id: payload.d.session_id,
          };
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
      case GatewayOpcodes.HeartbeatAck: {
        beatAcked = true;
        break;
      }
    }
  };

  ws.onerror = (e) => {
    console.error(`WebSocket error (shard ${config.shard[0]})`, e);
  };

  ws.onclose = ({ code, reason }) => {
    const shard = shards.get(shardId);
    if (shard) {
      clearInterval(shard.heartbeatInterval);
      if (code > 1001 && code < 2000) {
        code = 3001;
      }
      switch (code) {
        case GatewayCloseCodes.UnknownError:
        case GatewayCloseCodes.UnknownOpcode:
        case GatewayCloseCodes.DecodeError:
        case GatewayCloseCodes.NotAuthenticated:
        case GatewayCloseCodes.AlreadyAuthenticated:
        case GatewayCloseCodes.InvalidSeq:
        case GatewayCloseCodes.RateLimited:
        case GatewayCloseCodes.SessionTimedOut:
        case WSCodes.ResumeSession: {
          if (resumeData && seq !== null) {
            connectShard(resumeData.resume_gateway_url, config, {
              seq,
              sessionId: resumeData.session_id,
            });
            break;
          }
        }
        // eslint-disable-next-line no-fallthrough
        case WSCodes.NewSession: {
          connectShard(config.bot.url, config);
          break;
        }
        default: {
          shards.delete(shardId);
          console.log(
            `Connection closed with code ${code} - ${reason || "No reason provided"} (shard ${config.shard[0]})`,
          );
        }
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
        shard.ws.close(WSCodes.Disconnect, "Shard removed");
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
    ws.close(WSCodes.Disconnect, "Worker closed");
  }
  shards.clear();
});

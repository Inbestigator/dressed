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

interface Shard {
  ws: WebSocket;
  heartbeatInterval: NodeJS.Timeout;
  state: "Connecting" | "Disconnecting" | "Ready";
}

interface ShardConfig extends GatewayIdentifyData {
  intents: number;
  shard: [number, number];
  bot: APIGatewayBotInfo;
}

const shards = new Map<string, Shard>();

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
  NormalClose: 1000,
  GoingAway: 1001,
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
  const shard: Shard = {
    state: "Connecting",
    heartbeatInterval: null as never,
    ws,
  };
  shards.set(shardId, shard);

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
          shard.state = "Ready";
          shard.heartbeatInterval = setInterval(
            beat,
            payload.d.heartbeat_interval,
          );
        }, payload.d.heartbeat_interval * Math.random());
        break;
      }
      case GatewayOpcodes.InvalidSession:
      case GatewayOpcodes.Reconnect: {
        clearInterval(shard.heartbeatInterval);
        if (
          payload.op === GatewayOpcodes.InvalidSession &&
          payload.d === false
        ) {
          shard.ws.close(WSCodes.NormalClose, "Initiating full reset");
        } else {
          shard.ws.close(WSCodes.ResumeSession, "Reconnect message received");
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
    if (shard.state === "Disconnecting") {
      code = WSCodes.GoingAway;
    } else if (code === WSCodes.GoingAway) {
      code = WSCodes.NormalClose;
    }
    clearInterval(shard.heartbeatInterval);
    switch (code) {
      case GatewayCloseCodes.AuthenticationFailed:
      case GatewayCloseCodes.InvalidShard:
      case GatewayCloseCodes.ShardingRequired:
      case GatewayCloseCodes.InvalidAPIVersion:
      case GatewayCloseCodes.InvalidIntents:
      case GatewayCloseCodes.DisallowedIntents:
      case WSCodes.GoingAway: {
        shards.delete(shardId);
        console.log(
          `Connection closed with code ${code} - ${reason || "No reason provided"} (shard ${config.shard[0]})`,
        );
        break;
      }
      case GatewayCloseCodes.UnknownError:
      case GatewayCloseCodes.UnknownOpcode:
      case GatewayCloseCodes.DecodeError:
      case GatewayCloseCodes.AlreadyAuthenticated:
      case GatewayCloseCodes.RateLimited:
      case WSCodes.ResumeSession:
      default: {
        if (resumeData && seq !== null) {
          connectShard(resumeData.resume_gateway_url, config, {
            seq,
            sessionId: resumeData.session_id,
          });
          break;
        }
      }
      // eslint-disable-next-line no-fallthrough
      case GatewayCloseCodes.NotAuthenticated:
      case GatewayCloseCodes.InvalidSeq:
      case GatewayCloseCodes.SessionTimedOut:
      case WSCodes.NormalClose: {
        connectShard(config.bot.url, config);
        break;
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
        shard.state = "Disconnecting";
        clearInterval(shard.heartbeatInterval);
        shard.ws.close(WSCodes.NormalClose, "Shard removed");
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
  for (const shard of shards.values()) {
    shard.state = "Disconnecting";
    clearInterval(shard.heartbeatInterval);
    shard.ws.close(WSCodes.NormalClose, "Worker closed");
  }
  shards.clear();
});

import {
  GatewayOpcodes,
  type APIGatewayBotInfo,
  type GatewayIdentifyData,
  type GatewayReceivePayload,
} from "discord-api-types/v10";
import { platform } from "node:process";

let ws: WebSocket;
let heartbeatInterval: NodeJS.Timeout;
let lastSeq: number | null = null;

type WorkerMsg =
  | {
      type: "connect";
      config: GatewayIdentifyData & {
        intents: number;
        shard: [number, number];
        bot: APIGatewayBotInfo;
      };
    }
  | { type: "emit"; op: keyof typeof GatewayOpcodes; d: unknown };

onmessage = async ({ data: msg }: MessageEvent<WorkerMsg>) => {
  switch (msg.type) {
    case "connect": {
      ws = new WebSocket(msg.config.bot.url);

      function beat() {
        ws.send(
          JSON.stringify({
            op: GatewayOpcodes.Heartbeat,
            d: lastSeq,
          }),
        );
      }

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            op: GatewayOpcodes.Identify,
            d: {
              ...msg.config,
              properties: {
                os: platform,
                browser: "Dressed",
                device: "Dressed",
              },
              shard: msg.config.shard,
            },
          }),
        );
      };

      ws.onmessage = (e) => {
        const payload = JSON.parse(e.data) as GatewayReceivePayload;
        if (payload.s) lastSeq = payload.s;

        switch (payload.op) {
          case GatewayOpcodes.Hello: {
            heartbeatInterval = setInterval(beat, payload.d.heartbeat_interval);
            break;
          }
          case GatewayOpcodes.Dispatch: {
            postMessage({
              type: "dispatch",
              shard: msg.config.shard[0],
              t: payload.t,
              d: payload.d,
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
        console.error("WebSocket error", err);
      };

      ws.onclose = () => {
        clearInterval(heartbeatInterval);
        console.log("Shard", msg.config.shard[0], "disconnected");
      };

      break;
    }

    case "emit":
      ws?.send(JSON.stringify({ op: GatewayOpcodes[msg.op], d: msg.d }));
      break;
  }
};

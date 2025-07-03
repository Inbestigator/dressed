import {
  GatewayIntentBits,
  type GatewayIdentifyData,
  GatewayOpcodes,
  type APIGatewayBotInfo,
  GatewayDispatchEvents,
  type GatewayReceivePayload,
  type GatewayIdentify,
  type GatewayHeartbeat,
  Routes,
  type GatewayReadyDispatch,
} from "discord-api-types/v10";
import { botEnv, callDiscord } from "dressed/utils";
import { platform } from "node:process";

async function getGatewayBot(): Promise<APIGatewayBotInfo> {
  const res = await callDiscord(Routes.gatewayBot(), { method: "GET" });
  return res.json();
}

export async function createConnection(
  config: Omit<
    Partial<GatewayIdentifyData>,
    "intents" | "properties" | "compress" | "large_threshold"
  > & {
    /**
     * The Gateway Intents you wish to receive
     *
     * @see {@link https://discord.com/developers/docs/topics/gateway#gateway-intents}
     */
    intents?: (keyof typeof GatewayIntentBits)[];
    onReady?: (event: GatewayReadyDispatch["d"]) => void;
  },
) {
  const intents = (config.intents ?? []).reduce(
    (acc, intent) => acc | GatewayIntentBits[intent],
    0,
  );

  const { url } = await getGatewayBot();
  const ws = new WebSocket(url);

  let heartbeatInterval: NodeJS.Timeout;
  let lastSeq: number | null = null;

  ws.onmessage = (event) => {
    const payload = JSON.parse(event.data) as GatewayReceivePayload;

    if (payload.s !== null) {
      lastSeq = payload.s;
    }

    switch (payload.op) {
      case GatewayOpcodes.Hello: {
        const { heartbeat_interval } = payload.d;

        heartbeatInterval = setInterval(() => {
          const heartbeatPayload: GatewayHeartbeat = {
            op: GatewayOpcodes.Heartbeat,
            d: lastSeq,
          };
          ws.send(JSON.stringify(heartbeatPayload));
        }, heartbeat_interval);

        const identifyPayload: GatewayIdentify = {
          op: GatewayOpcodes.Identify,
          d: {
            token: botEnv.DISCORD_TOKEN,
            ...config,
            properties: {
              os: platform,
              browser: "Dressed",
              device: "Dressed",
            },
            intents,
          },
        };
        ws.send(JSON.stringify(identifyPayload));
        break;
      }
      case GatewayOpcodes.Dispatch: {
        if (payload.t === GatewayDispatchEvents.Ready) {
          config.onReady?.(payload.d);
        }
        break;
      }
      case GatewayOpcodes.HeartbeatAck: {
        break;
      }
      default:
        break;
    }
  };

  ws.onclose = () => {
    clearInterval(heartbeatInterval);
    console.log("Disconnected");
  };

  ws.onerror = (err) => {
    console.error("WebSocket error", err);
  };
}

import type { RESTGetAPIGatewayBotResult, RESTGetAPIGatewayResult } from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../utils/call-discord.ts";

/**
 * Returns an object with a valid WSS URL which the app can use when Connecting to the Gateway.
 */
export async function getGateway(): Promise<RESTGetAPIGatewayResult> {
  const res = await callDiscord(Routes.gateway(), {
    method: "GET",
  });

  return res.json();
}

/**
 * Returns an object based on the information in Get Gateway, plus additional metadata that can help during the operation of large or sharded bots.
 */
export async function getGatewayBot(): Promise<RESTGetAPIGatewayBotResult> {
  const res = await callDiscord(Routes.gatewayBot(), {
    method: "GET",
  });

  return res.json();
}

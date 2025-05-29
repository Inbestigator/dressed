import type {
  RESTGetCurrentApplicationResult,
  RESTPatchCurrentApplicationJSONBody,
  RESTPatchCurrentApplicationResult,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../utils/call-discord.ts";

/**
 * Get the current bot application.
 */
export async function getApp(): Promise<RESTGetCurrentApplicationResult> {
  const res = await callDiscord(Routes.currentApplication(), {
    method: "GET",
  });

  return res.json();
}

/**
 * Update the current bot application.
 * @param data New data for the application
 */
export async function modifyApp(
  data: RESTPatchCurrentApplicationJSONBody,
): Promise<RESTPatchCurrentApplicationResult> {
  const res = await callDiscord(Routes.currentApplication(), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

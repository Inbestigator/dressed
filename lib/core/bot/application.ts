import {
  type APIApplication,
  type RESTPatchCurrentApplicationJSONBody,
  Routes,
} from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";

/**
 * Get the current bot application.
 */
export async function getApp(): Promise<APIApplication> {
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
): Promise<APIApplication> {
  const res = await callDiscord(Routes.currentApplication(), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

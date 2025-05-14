import type {
  RESTGetAPIStageInstanceResult,
  RESTPatchAPIStageInstanceJSONBody,
  RESTPatchAPIStageInstanceResult,
  RESTPostAPIStageInstanceJSONBody,
  RESTPostAPIStageInstanceResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../utils.ts";

/**
 * Creates a new Stage instance associated to a Stage channel.
 * @param data The data to create the Stage instance with
 */
export async function createStage(
  data: RESTPostAPIStageInstanceJSONBody,
): Promise<RESTPostAPIStageInstanceResult> {
  const res = await callDiscord(Routes.stageInstances(), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Gets the stage instance associated with the Stage channel, if it exists.
 * @param channel The channel to get the Stage instance for
 */
export async function getStage(
  channel: Snowflake,
): Promise<RESTGetAPIStageInstanceResult> {
  const res = await callDiscord(Routes.stageInstance(channel), {
    method: "GET",
  });

  return res.json();
}

/**
 * Updates fields of an existing Stage instance.
 * @param channel The channel to modify the Stage instance for
 * @param data The new data for the Stage instance
 */
export async function modifyStage(
  channel: Snowflake,
  data: RESTPatchAPIStageInstanceJSONBody,
): Promise<RESTPatchAPIStageInstanceResult> {
  const res = await callDiscord(Routes.stageInstance(channel), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Deletes the Stage instance.
 * @param channel The channel to delete the Stage instance for
 */
export async function deleteStage(channel: Snowflake): Promise<void> {
  await callDiscord(Routes.stageInstance(channel), {
    method: "DELETE",
  });
}

import {
  createMessage as dressedCreateMessage,
  editMessage as dressedEditMessage,
} from "dressed";
import type { RawFile } from "dressed/server";
import {
  MessageFlags,
  type RESTPatchAPIChannelMessageJSONBody,
  type RESTPostAPIChannelMessageJSONBody,
  type Snowflake,
} from "discord-api-types/v10";
import type { ReactNode } from "react";
import { render } from "./index.ts";

/**
 * Renders the provided children and posts a message to a guild text or DM channel with the `IsComponentsV2` flag.
 * @example createMessage(channelId, <Button label="Foo" />)
 * @param channel The channel to post the message to
 * @param components The contents of the message
 * @param data The message data
 */
export async function createMessage(
  channel: Snowflake,
  components: ReactNode,
  data: Omit<RESTPostAPIChannelMessageJSONBody, "content"> & {
    files?: RawFile[];
  } = {},
) {
  data.flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;
  data.components = (await render(components)).components as never;
  return dressedCreateMessage(channel, data);
}

/**
 * Renders the provided children and edits a previously sent message.
 * @example editMessage(channelId, messageId, <Button label="Bar" />)
 * @param channel The channel to edit the message in
 * @param components The contents of the message
 * @param data The new message data
 */
export async function editMessage(
  channel: Snowflake,
  message: Snowflake,
  components: ReactNode,
  data: Omit<RESTPatchAPIChannelMessageJSONBody, "content"> & {
    files?: RawFile[];
  } = {},
) {
  data.flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;
  data.components = (await render(components)).components as never;
  return dressedEditMessage(channel, message, data);
}

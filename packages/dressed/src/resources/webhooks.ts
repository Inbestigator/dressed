import type {
  RESTGetAPIChannelWebhooksResult,
  RESTGetAPIGuildWebhooksResult,
  RESTGetAPIWebhookResult,
  RESTGetAPIWebhookWithTokenMessageQuery,
  RESTGetAPIWebhookWithTokenMessageResult,
  RESTGetAPIWebhookWithTokenResult,
  RESTPatchAPIWebhookJSONBody,
  RESTPatchAPIWebhookResult,
  RESTPatchAPIWebhookWithTokenJSONBody,
  RESTPatchAPIWebhookWithTokenMessageJSONBody,
  RESTPatchAPIWebhookWithTokenMessageQuery,
  RESTPatchAPIWebhookWithTokenMessageResult,
  RESTPatchAPIWebhookWithTokenResult,
  RESTPostAPIChannelWebhookJSONBody,
  RESTPostAPIChannelWebhookResult,
  RESTPostAPIWebhookWithTokenJSONBody,
  RESTPostAPIWebhookWithTokenQuery,
  RESTPostAPIWebhookWithTokenWaitResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../utils/call-discord.ts";
import type { RawFile } from "../types/file.ts";

/**
 * Creates a new webhook.
 * @param channel The channel to create the webhooks on
 * @param data The data for the new webhook
 */
export async function createWebhook(
  channel: Snowflake,
  data: RESTPostAPIChannelWebhookJSONBody,
): Promise<RESTPostAPIChannelWebhookResult> {
  const res = await callDiscord(Routes.webhook(channel), {
    method: "POST",
    body: data,
  });

  return res.json();
}

/**
 * Returns a list of channel webhook objects.
 * @param channel The channel to get the webhooks from
 */
export async function listChannelWebhooks(
  channel: Snowflake,
): Promise<RESTGetAPIChannelWebhooksResult> {
  const res = await callDiscord(Routes.channelWebhooks(channel), {
    method: "GET",
  });

  return res.json();
}

/**
 * Returns a list of guild webhook objects.
 * @param guild The guild to get the webhooks from
 */
export async function listGuildWebhooks(
  guild: Snowflake,
): Promise<RESTGetAPIGuildWebhooksResult> {
  const res = await callDiscord(Routes.guildWebhooks(guild), {
    method: "GET",
  });

  return res.json();
}

/**
 * Returns the new webhook object for the given id.
 * @param webhook The webhook to get
 * @param token The webhook token
 */
export async function getWebhook<T extends string | undefined = undefined>(
  webhook: Snowflake,
  token?: T,
): Promise<
  T extends string ? RESTGetAPIWebhookWithTokenResult : RESTGetAPIWebhookResult
> {
  const res = await callDiscord(Routes.webhook(webhook, token), {
    method: "GET",
  });

  return res.json();
}

/**
 * Modify a webhook.
 * @param webhook The webhook to modify
 * @param data The new data for the webhook
 * @param token The webhook token
 */
export async function modifyWebhook<T extends string | undefined = undefined>(
  webhook: Snowflake,
  data: T extends string
    ? RESTPatchAPIWebhookWithTokenJSONBody
    : RESTPatchAPIWebhookJSONBody,
  token?: T,
): Promise<
  T extends string
    ? RESTPatchAPIWebhookWithTokenResult
    : RESTPatchAPIWebhookResult
> {
  const res = await callDiscord(Routes.webhook(webhook, token), {
    method: "PATCH",
    body: data,
  });

  return res.json();
}

/**
 * Delete a webhook permanently.
 * @param webhook The webhook to delete
 * @param token The webhook token
 */
export async function deleteWebhook(
  webhook: Snowflake,
  token?: string,
): Promise<void> {
  await callDiscord(Routes.webhook(webhook, token), {
    method: "DELETE",
  });
}

/**
 * Execute a webhook.
 * @param webhook The webhook to use
 * @param token The webhook token
 * @param data The message data
 * @param options Optional parameters for the request
 */
export async function executeWebhook<
  T extends RESTPostAPIWebhookWithTokenQuery,
>(
  webhook: Snowflake,
  token: string,
  data: string | (RESTPostAPIWebhookWithTokenJSONBody & { files?: RawFile[] }),
  options?: T,
): Promise<
  T["wait"] extends true ? RESTPostAPIWebhookWithTokenWaitResult : void
> {
  if (typeof data === "string") {
    data = { content: data };
  }

  const files = data.files;
  delete data.files;

  const res = await callDiscord(Routes.webhook(webhook, token), {
    method: "POST",
    body: data,
    params: options,
    files,
  });

  return res.json();
}

/**
 * Returns a previously-sent webhook message from the same token.
 * @param webhook The webhook to use
 * @param token The webhook token
 * @param message The message to get
 * @param options Optional parameters for the request
 */
export async function getWebhookMessage(
  webhook: Snowflake,
  token: string,
  message: Snowflake,
  options?: RESTGetAPIWebhookWithTokenMessageQuery,
): Promise<RESTGetAPIWebhookWithTokenMessageResult> {
  const res = await callDiscord(
    Routes.webhookMessage(webhook, token, message),
    {
      method: "GET",
      params: options,
    },
  );

  return res.json();
}

/**
 * Edits a previously-sent webhook message from the same token.
 * @param webhook The webhook to use
 * @param token The webhook token
 * @param message The message to edit
 * @param data The new message data
 * @param options Optional parameters for the request
 */
export async function editWebhookMessage(
  webhook: Snowflake,
  token: string,
  message: Snowflake,
  data:
    | string
    | (RESTPatchAPIWebhookWithTokenMessageJSONBody & { files?: RawFile[] }),
  options?: RESTPatchAPIWebhookWithTokenMessageQuery,
): Promise<RESTPatchAPIWebhookWithTokenMessageResult> {
  if (typeof data === "string") {
    data = { content: data };
  }

  const files = data.files;
  delete data.files;

  const res = await callDiscord(
    Routes.webhookMessage(webhook, token, message),
    {
      method: "PATCH",
      body: data,
      params: options,
      files,
    },
  );

  return res.json();
}

/**
 * Deletes a message that was created by the webhook.
 * @param webhook The webhook to use
 * @param token The webhook token
 * @param message The message to delete
 */
export async function deleteWebhookMessage(
  webhook: Snowflake,
  token: string,
  message: Snowflake,
  options?: Pick<RESTPostAPIWebhookWithTokenQuery, "thread_id">,
): Promise<void> {
  await callDiscord(Routes.webhookMessage(webhook, token, message), {
    method: "DELETE",
    params: options,
  });
}

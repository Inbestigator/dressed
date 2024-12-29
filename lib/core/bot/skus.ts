import type { APISKU, APISubscription, Snowflake } from "discord-api-types/v10";
import { RouteBases, Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";
import process from "node:process";

const appId = process.env.APP_ID;

/**
 * Returns all SKUs for the application.
 */
export async function listSKUs(): Promise<APISKU[]> {
  const res = await callDiscord(
    Routes.skus(appId as string),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Returns all subscriptions containing the SKU, filtered by user.
 * @param sku The sku to get the subscriptions for
 * @param options Query parameters for filtering the subscriptions
 */
export async function listSubscriptions(
  sku: Snowflake,
  options?: {
    /** Get subscriptions before this subscription ID */
    before?: Snowflake;
    /** Get subscriptions after this subscription ID */
    after?: Snowflake;
    /** The maximum number of subscriptions to return */
    limit?: number;
    /** Get subscriptions for this user ID */
    user_id?: Snowflake;
  },
): Promise<APISubscription[]> {
  const url = new URL(Routes.skuSubscriptions(sku), RouteBases.api);

  if (options?.before) url.searchParams.append("before", options.before);
  if (options?.after) url.searchParams.append("after", options.after);
  if (options?.limit) {
    url.searchParams.append("limit", options.limit.toString());
  }
  if (options?.user_id) url.searchParams.append("user_id", options.user_id);

  const res = await callDiscord(
    url.toString(),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Get a subscription by its ID.
 * @param sku The sku to get the subscription for
 * @param subscription The subscription to get
 */
export async function getSubscription(
  sku: Snowflake,
  subscription: Snowflake,
): Promise<APISubscription> {
  const res = await callDiscord(
    Routes.skuSubscription(sku, subscription),
    {
      method: "GET",
    },
  );

  return res.json();
}

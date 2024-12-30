import type {
  RESTGetAPISKUsResult,
  RESTGetAPISKUSubscriptionResult,
  RESTGetAPISKUSubscriptionsQuery,
  RESTGetAPISKUSubscriptionsResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";
import process from "node:process";

const appId = process.env.APP_ID;

/**
 * Returns all SKUs for the application.
 */
export async function listSKUs(): Promise<RESTGetAPISKUsResult> {
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
 * @param options Optional parameters for the request
 */
export async function listSubscriptions(
  sku: Snowflake,
  options?: RESTGetAPISKUSubscriptionsQuery,
): Promise<RESTGetAPISKUSubscriptionsResult> {
  const res = await callDiscord(
    Routes.skuSubscriptions(sku),
    {
      method: "GET",
      params: options as Record<string, unknown>,
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
): Promise<RESTGetAPISKUSubscriptionResult> {
  const res = await callDiscord(
    Routes.skuSubscription(sku, subscription),
    {
      method: "GET",
    },
  );

  return res.json();
}

import type {
  APIEntitlement,
  RESTPostAPIEntitlementJSONBody,
  RESTPostAPIEntitlementResult,
  Snowflake,
} from "discord-api-types/v10";
import { Routes } from "discord-api-types/v10";
import { callDiscord } from "../../internal/utils.ts";
import process from "node:process";

const appId = process.env.APP_ID;

/**
 * Returns all entitlements for the app, active and expired.
 */
export async function listEntitlements(): Promise<APIEntitlement[]> {
  const res = await callDiscord(
    Routes.entitlements(appId as string),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * Returns an entitlements.
 * @param entitlement The entitlement to get
 */
export async function getEntitlement(
  entitlement: Snowflake,
): Promise<APIEntitlement> {
  const res = await callDiscord(
    Routes.entitlement(appId as string, entitlement),
    {
      method: "GET",
    },
  );

  return res.json();
}

/**
 * For One-Time Purchase consumable SKUs, marks a given entitlement for the user as consumed.
 * @param entitlement The entitlement to consume
 */
export async function consumeEntitlement(
  entitlement: Snowflake,
): Promise<void> {
  await callDiscord(
    Routes.consumeEntitlement(appId as string, entitlement),
    {
      method: "POST",
    },
  );
}

/**
 * Creates a test entitlement to a given SKU for a given guild or user. Discord will act as though that user or guild has entitlement to your premium offering.
 * @param entitlement The entitlement to consume
 */
export async function createTestEntitlement(
  data: RESTPostAPIEntitlementJSONBody,
): Promise<RESTPostAPIEntitlementResult> {
  const res = await callDiscord(
    Routes.entitlements(appId as string),
    {
      method: "POST",
      body: data,
    },
  );

  return res.json();
}

/**
 * Deletes a currently-active test entitlement. Discord will act as though that user or guild no longer has entitlement to your premium offering.
 * @param entitlement The entitlement to delete
 */
export async function deleteTestEntitlement(
  entitlement: Snowflake,
): Promise<void> {
  await callDiscord(
    Routes.entitlement(appId as string, entitlement),
    {
      method: "DELETE",
    },
  );
}

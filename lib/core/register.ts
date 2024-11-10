import { InstallGlobalCommands } from "../internal/utils.ts";

const testCommand = {
  name: "test",
  description: "Basic command",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

InstallGlobalCommands(Deno.env.get("DISCORD_APP_ID") as string, [testCommand]);

import "jsr:@std/dotenv/load";

export async function DiscordRequest(
  endpoint: string,
  options: Record<string, unknown>,
) {
  const url = "https://discord.com/api/v10/" + endpoint;
  if (options.body) options.body = JSON.stringify(options.body);
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${Deno.env.get("DISCORD_TOKEN")}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
    },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  return res;
}

export async function InstallGlobalCommands(
  appId: string,
  commands: {
    name: string;
    description: string;
    type: number;
    integration_types: number[];
    contexts: number[];
    options?: { name: string; description: string; type: number }[];
  }[],
) {
  const endpoint = `applications/${appId}/commands`;

  try {
    await DiscordRequest(endpoint, { method: "PUT", body: commands });
  } catch (err) {
    console.error(err);
  }
}

import type { APIChatInputApplicationCommandInteraction } from "discord-api-types/v10";
import { createInteraction, createServer } from "dressed/server";
import { serverConfig } from "dressed/utils";

function log(key: string, data) {
  console.log(key, data);
}

function wrapMethods<T>(target: T, methods: string[], callback: (method: string, args: unknown[]) => void) {
  for (const method of methods as (keyof T)[]) {
    const original = target[method];
    if (typeof original !== "function") continue;

    target[method] = ((...args: unknown[]) => {
      callback(String(method), args);
      return original(...args);
    }) as T[typeof method];
  }
}

export function patchInteraction<T extends NonNullable<ReturnType<typeof createInteraction>>>(interaction: T): T {
  log(`interaction:${interaction.id}`, {
    guildId: interaction.guild_id,
    channelId: interaction.channel?.id,
    userId: interaction.user.id,
    type: interaction.type,
  });
  wrapMethods(
    interaction,
    ["reply", "deferReply", "update", "deferUpdate", "editReply", "followUp", "showModal", "sendChoices"],
    (method, [first]) => {
      log(`response:${method}`, first);
    },
  );

  wrapMethods(interaction, ["getOption", "getValues", "getField"], (method, [first]) => {
    log(`data-access:${method}`, { accessed: first });
  });

  return interaction;
}

const a = patchInteraction(createInteraction({} as APIChatInputApplicationCommandInteraction));

serverConfig.port = 3000;
serverConfig.requests = {
  // routeBase: "http://localhost:3000",
  env: {},
};
serverConfig.middleware = {
  commands(i) {
    console.log(patchInteraction(i));
    return [i];
  },
};

// createServer([{ data: {}, exports: { default() {} }, name: "test", path: "", uid: "" }], [], []);

a.getOption("wasd");

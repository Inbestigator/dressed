import { createInteraction, createServer, type ServerConfig } from "dressed/server";
import { serverConfig } from "dressed/utils";

function log(key: string, data) {
  console.log(key, data);
}

// function wrapMethods<T>(target: T, methods: string[], callback: (method: string, args: unknown[]) => void) {
//   for (const method of methods as (keyof T)[]) {
//     const original = target[method];
//     if (typeof original !== "function") continue;

//     target[method] = ((...args: unknown[]) => {
//       callback(String(method), args);
//       return original(...args);
//     }) as T[typeof method];
//   }
// }

// export function patchInteraction<T extends NonNullable<ReturnType<typeof createInteraction>>>(interaction: T): T {
//   log(`interaction:${interaction.id}`, {
//     guildId: interaction.guild_id,
//     channelId: interaction.channel?.id,
//     userId: interaction.user.id,
//     type: interaction.type,
//   });
//   wrapMethods(
//     interaction,
//     ["reply", "deferReply", "update", "deferUpdate", "editReply", "followUp", "showModal", "sendChoices"],
//     (method, [first]) => {
//       log(`response:${method}`, first);
//     },
//   );

//   wrapMethods(interaction, ["getOption", "getValues", "getField"], (method, [first]) => {
//     log(`data-access:${method}`, { accessed: first });
//   });

//   return interaction;
// }

function mw<T extends unknown[], R>(next?: (...p: T) => R) {
  return (...p: T) => {
    const interaction = p[0] as NonNullable<ReturnType<typeof createInteraction>>;
    log(`interaction:${interaction.id}`, {
      guildId: interaction.guild_id,
      channelId: interaction.channel?.id,
      userId: interaction.user.id,
      type: interaction.type,
    });
    return next?.(...p) ?? p;
  };
}

function analyticsMiddleware(
  next: ServerConfig["middleware"] = {},
): Required<Pick<NonNullable<ServerConfig["middleware"]>, "commands" | "components">> &
  Pick<NonNullable<ServerConfig["middleware"]>, "events"> {
  return {
    commands: mw(next.commands),
    components: mw(next.components),
    events: next.events,
  };
}

serverConfig.port = 3000;
serverConfig.requests = {
  // routeBase: "http://localhost:3000",
  env: {},
};

serverConfig.middleware = analyticsMiddleware({
  commands(i) {
    return [i];
  },
});

// createServer([{ data: {}, exports: { default() {} }, name: "test", path: "", uid: "" }], [], []);

import type { CommandConfig, CommandInteraction } from "dressed";

export const config: CommandConfig = {
  description: "Replies with Pong!",
};

export default async function (interaction: CommandInteraction) {
  console.log("a");
  await interaction.reply("Pong!");
}

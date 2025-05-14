import type { CommandConfig, CommandInteraction } from "dressed";

export const config: CommandConfig = {
  description: "Replies with Pong!",
};

export default async function (interaction: CommandInteraction) {
  await interaction.reply("Pong!");
}

import type { CommandConfig, CommandInteraction } from "dressed";

export const config = {
  description: "Replies with Pong!",
} satisfies CommandConfig;

export default async function (interaction: CommandInteraction) {
  await interaction.reply("Pong!");
}

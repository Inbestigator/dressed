import type { CommandConfig, CommandInteraction } from "@dressed/dressed";

export const config: CommandConfig = {
  description: "Replies with Pong!",
};

export default async function ping(interaction: CommandInteraction) {
  await interaction.reply({
    content: "Pong!",
    ephemeral: true,
  });
}

import type { CommandConfig, CommandInteraction } from "@dressed/dressed";

export const config: CommandConfig = {
  description: "Replies with Pong!",
};

export default async function ping(interaction: CommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  await interaction.editReply({
    content: "Pong!",
  });
}

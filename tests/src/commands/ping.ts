import type { CommandInteraction } from "@inbestigator/discord-http";

export default async function ping(interaction: CommandInteraction) {
  await interaction.reply({
    content: "Pong!",
    ephemeral: true,
  });
}

import type { MessageComponentInteraction } from "@inbestigator/discord-http";

export default async function button(interaction: MessageComponentInteraction) {
  await interaction.reply("Button clicked!");
}

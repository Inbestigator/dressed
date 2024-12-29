import type { MessageComponentInteraction } from "@dressed/dressed";

export default async function button(interaction: MessageComponentInteraction) {
  await interaction.reply("Button clicked!");
}

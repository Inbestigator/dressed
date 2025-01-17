import type { MessageComponentInteraction } from "@dressed/dressed";

export default async function button(
  interaction: MessageComponentInteraction,
  { arg }: { arg: string },
) {
  console.log(arg);
  await interaction.reply("Button clicked!");
}

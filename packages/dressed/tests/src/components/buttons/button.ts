import type { MessageComponentInteraction } from "dressed";

export const pattern = "button_:arg";

export default async function (
  interaction: MessageComponentInteraction,
  { arg }: { arg: string },
) {
  console.log(arg);
  await interaction.reply("Button clicked!");
}

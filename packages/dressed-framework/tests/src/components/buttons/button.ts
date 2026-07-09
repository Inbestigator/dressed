import type { Params } from "@dressed/matcher";
import type { MessageComponentInteraction } from "dressed";

export const pattern = "button_:arg";

export default async function (interaction: MessageComponentInteraction, { arg }: Params<typeof pattern>) {
  console.log(arg);
  await interaction.reply("Button clicked!");
}

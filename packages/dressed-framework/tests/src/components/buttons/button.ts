import type { Params } from "@dressed/matcher";
import type { ComponentInteraction } from "dressed";

export const pattern = "button_:arg";

export default async function (interaction: ComponentInteraction, { arg }: Params<typeof pattern>) {
  console.log(arg);
  await interaction.reply("Button clicked!");
}

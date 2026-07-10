import type { ComponentInteraction } from "dressed";

export default async function (interaction: ComponentInteraction<"RoleSelect">) {
  console.log(interaction.values);
}

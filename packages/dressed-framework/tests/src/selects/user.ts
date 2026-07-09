import type { MessageComponentInteraction } from "dressed";

export default async function (interaction: MessageComponentInteraction<"RoleSelect">) {
  console.log(interaction.values);
}

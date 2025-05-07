import type { CommandConfig, CommandInteraction } from "@dressed/dressed";
import { MessageFlags } from "discord-api-types/v10";

export const config: CommandConfig = {
  description: "Replies with Pong!",
};

export default async function ping(interaction: CommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  await interaction.editReply({
    content: "Pong!",
    components: [{
      type: 10,
      content: "Pong!",
    }],
    flags: MessageFlags.IsComponentsV2,
  });
}

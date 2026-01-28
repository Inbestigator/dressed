import { isMessageComponentSelectMenuInteraction } from "discord-api-types/utils";
import {
  type APIInteractionDataResolved,
  type APIMessageComponentInteraction,
  ComponentType,
} from "discord-api-types/v10";

export function parseValues(input: APIMessageComponentInteraction) {
  if (!isMessageComponentSelectMenuInteraction(input)) return;
  const resolved: Partial<APIInteractionDataResolved> = "resolved" in input.data ? input.data.resolved : {};
  const returnValues = (resolvedKey: keyof APIInteractionDataResolved) => {
    if (!resolved?.[resolvedKey]) {
      throw new Error(`No ${resolvedKey} found`);
    }
    return input.data.values.map((v) => resolved[resolvedKey]?.[v]);
  };
  switch (input.data.component_type) {
    case ComponentType.StringSelect:
      return input.data.values;
    case ComponentType.UserSelect:
      return returnValues("users");
    case ComponentType.RoleSelect:
      return returnValues("roles");
    case ComponentType.MentionableSelect: {
      if (!resolved?.users && !resolved?.roles) {
        throw new Error(`No mentionables found`);
      }
      const mentionables = [];
      for (const value of input.data.values) {
        mentionables.push(resolved.users?.[value] ?? resolved.roles?.[value]);
      }
      return mentionables;
    }
    case ComponentType.ChannelSelect:
      return returnValues("channels");
  }
}

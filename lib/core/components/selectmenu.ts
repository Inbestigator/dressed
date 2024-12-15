import type {
  APIChannelSelectComponent,
  APIMentionableSelectComponent,
  APIRoleSelectComponent,
  APISelectMenuComponent,
  APIStringSelectComponent,
  APIUserSelectComponent,
} from "discord-api-types/v10";

enum SelectType {
  Channel = 8,
  Mentionable = 7,
  Role = 6,
  String = 3,
  User = 5,
}

interface ChannelSelect extends Omit<APIChannelSelectComponent, "type"> {
  type: "Channel";
}
interface MentionableSelect
  extends Omit<APIMentionableSelectComponent, "type"> {
  type: "Mentionable";
}
interface RoleSelect extends Omit<APIRoleSelectComponent, "type"> {
  type: "Role";
}
interface StringSelect extends Omit<APIStringSelectComponent, "type"> {
  type: "String";
}
interface UserSelect extends Omit<APIUserSelectComponent, "type"> {
  type: "User";
}

/**
 * Creates a select menu component
 */
export function SelectMenu(
  data:
    | ChannelSelect
    | MentionableSelect
    | RoleSelect
    | StringSelect
    | UserSelect,
): APISelectMenuComponent {
  const select = {
    ...data,
    type: SelectType[data.type],
  };

  return select as unknown as APISelectMenuComponent;
}

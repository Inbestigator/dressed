import {
  ActionRow,
  Button,
  CommandOption,
  SelectMenu,
  TextInput,
} from "@dressed/dressed";
import { assertEquals } from "@std/assert/equals";

Deno.test("Button component", () => {
  assertEquals(
    Button({
      label: "Click me",
      custom_id: "button_id",
      style: "Primary",
    }),
    {
      type: 2,
      custom_id: "button_id",
      style: 1,
      label: "Click me",
    },
  );
});

Deno.test("Action row component", () => {
  assertEquals(ActionRow(), {
    type: 1,
    components: [],
  });
});

Deno.test("Command option component", () => {
  assertEquals(
    CommandOption({
      name: "test",
      description: "test",
      type: "String",
      max_length: 10,
    }),
    {
      name: "test",
      description: "test",
      type: 3,
      max_length: 10,
    },
  );
});

Deno.test("String select menu component", () => {
  assertEquals(
    SelectMenu({
      custom_id: "select_id",
      type: "String",
      options: [{ label: "test", value: "test" }],
    }),
    {
      type: 3,
      custom_id: "select_id",
      options: [{ label: "test", value: "test" }],
    },
  );
});

Deno.test("Channel select menu component", () => {
  assertEquals(
    SelectMenu({
      custom_id: "select_id",
      type: "Channel",
    }),
    {
      type: 8,
      custom_id: "select_id",
    },
  );
});

Deno.test("User select menu component", () => {
  assertEquals(
    SelectMenu({
      custom_id: "select_id",
      type: "User",
    }),
    {
      type: 5,
      custom_id: "select_id",
    },
  );
});

Deno.test("Role select menu component", () => {
  assertEquals(
    SelectMenu({
      custom_id: "select_id",
      type: "Role",
    }),
    {
      type: 6,
      custom_id: "select_id",
    },
  );
});

Deno.test("Mentionable select menu component", () => {
  assertEquals(
    SelectMenu({
      custom_id: "select_id",
      type: "Mentionable",
    }),
    {
      type: 7,
      custom_id: "select_id",
    },
  );
});

Deno.test("Text input component", () => {
  assertEquals(
    TextInput({
      label: "test",
      custom_id: "input_id",
      style: "Short",
    }),
    {
      label: "test",
      type: 4,
      custom_id: "input_id",
      style: 1,
    },
  );
});

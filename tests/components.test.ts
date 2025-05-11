import {
  ActionRow,
  Button,
  CommandOption,
  Container,
  File,
  MediaGallery,
  MediaGalleryItem,
  Section,
  SelectMenu,
  SelectMenuOption,
  Separator,
  TextDisplay,
  TextInput,
  Thumbnail,
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
      options: [SelectMenuOption("test", "test")],
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

Deno.test("Text input component", () => {
  assertEquals(
    TextInput({
      label: "test",
      custom_id: "input_id",
      style: "Paragraph",
    }),
    {
      label: "test",
      type: 4,
      custom_id: "input_id",
      style: 2,
    },
  );
});

Deno.test("Section component", () => {
  assertEquals(
    Section(["test"], Button({ label: "Click me", custom_id: "button_id" })),
    {
      components: [{
        content: "test",
        type: 10,
      }],
      accessory: {
        type: 2,
        label: "Click me",
        custom_id: "button_id",
        style: 1,
      },
      type: 9,
    },
  );
});

Deno.test("Text display component", () => {
  assertEquals(
    TextDisplay("test"),
    {
      content: "test",
      type: 10,
    },
  );
});

Deno.test("Thumbnail component", () => {
  assertEquals(
    Thumbnail("https://example.com"),
    {
      media: { url: "https://example.com" },
      type: 11,
    },
  );
});

Deno.test("Media gallery component", () => {
  assertEquals(
    MediaGallery([MediaGalleryItem("https://example.com")], { id: 1 }),
    {
      items: [{
        media: { url: "https://example.com" },
      }],
      id: 1,
      type: 12,
    },
  );
});

Deno.test("File component", () => {
  assertEquals(
    File("https://example.com"),
    {
      file: { url: "https://example.com" },
      type: 13,
    },
  );
});

Deno.test("Separator component", () => {
  assertEquals(
    Separator(),
    {
      spacing: 1,
      type: 14,
    },
  );
});

Deno.test("Container component", () => {
  assertEquals(
    Container(
      ActionRow(
        Button({ label: "Click me", custom_id: "1" }),
        Button({ label: "Click me", custom_id: "2" }),
      ),
      Separator(),
    ),
    {
      components: [
        {
          components: [
            {
              type: 2,
              label: "Click me",
              custom_id: "1",
              style: 1,
            },
            {
              type: 2,
              label: "Click me",
              custom_id: "2",
              style: 1,
            },
          ],
          type: 1,
        },
        {
          spacing: 1,
          type: 14,
        },
      ],
      type: 17,
    },
  );
});

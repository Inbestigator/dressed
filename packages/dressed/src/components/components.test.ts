import { expect, test } from "bun:test";
import { ActionRow } from "./action-row.ts";
import { Button } from "./button.ts";
import { Checkbox, CheckboxGroup } from "./checkbox.ts";
import { CommandOption } from "./command-option.ts";
import { Container } from "./container.ts";
import { File } from "./file.ts";
import { FileUpload } from "./file-upload.ts";
import { Label } from "./label.ts";
import { MediaGallery, MediaGalleryItem } from "./media-gallery.ts";
import { RadioGroup, RadioGroupOption } from "./radio-group.ts";
import { Section } from "./section.ts";
import { SelectMenu, SelectMenuOption } from "./select-menu.ts";
import { Separator } from "./separator.ts";
import { TextDisplay } from "./text-display.ts";
import { TextInput } from "./text-input.ts";
import { Thumbnail } from "./thumbnail.ts";

test("Command option function", () => {
  expect(
    CommandOption({
      name: "test",
      description: "test",
      type: "String",
      max_length: 10,
    }),
  ).toMatchSnapshot();
});

test("Action row component", () => {
  expect(ActionRow()).toMatchSnapshot();
});

test("Button component", () => {
  expect(
    Button({
      label: "Click me",
      custom_id: "button_id",
      style: "Primary",
    }),
  ).toMatchSnapshot();
});

test("String select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "String",
      options: [SelectMenuOption("test", "test")],
    }),
  ).toMatchSnapshot();
});

test("Channel select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "Channel",
    }),
  ).toMatchSnapshot();
});

test("User select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "User",
    }),
  ).toMatchSnapshot();
});

test("Role select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "Role",
    }),
  ).toMatchSnapshot();
});

test("Mentionable select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "Mentionable",
    }),
  ).toMatchSnapshot();
});

test("Text input component", () => {
  expect(
    TextInput({
      label: "test",
      custom_id: "input_id",
      style: "Short",
    }),
  ).toMatchSnapshot();
});

test("Text input component", () => {
  expect(
    TextInput({
      label: "test",
      custom_id: "input_id",
      style: "Paragraph",
    }),
  ).toMatchSnapshot();
});

test("Section component", () => {
  expect(Section(["test"], Button({ label: "Click me", custom_id: "button_id" }))).toMatchSnapshot();
});

test("Text display component", () => {
  expect(TextDisplay("test")).toMatchSnapshot();
});

test("Thumbnail component", () => {
  expect(Thumbnail("https://example.com")).toMatchSnapshot();
});

test("Media gallery component", () => {
  expect(MediaGallery([MediaGalleryItem("https://example.com")], { id: 1 })).toMatchSnapshot();
  expect(MediaGallery(MediaGalleryItem("https://example.com"))).toMatchSnapshot();
});

test("File component", () => {
  expect(File("https://example.com")).toMatchSnapshot();
});

test("Separator component", () => {
  expect(Separator()).toMatchSnapshot();
});

test("Container component", () => {
  expect(
    Container(
      ActionRow(Button({ label: "Click me", custom_id: "1" }), Button({ label: "Click me", custom_id: "2" })),
      Separator(),
    ),
  ).toMatchSnapshot();
  expect(
    Container(
      [
        ActionRow(Button({ label: "Click me", custom_id: "1" }), Button({ label: "Click me", custom_id: "2" })),
        Separator(),
      ],
      { id: 1 },
    ),
  ).toMatchSnapshot();
});

test("Label component", () => {
  expect(
    Label(
      "What did you find interesting about the game?",
      TextInput({
        custom_id: "game_feedback",
        label: "Write your feedback here...",
        style: "Paragraph",
        min_length: 100,
        max_length: 4000,
        required: true,
      }),
      "Please give us as much detail as possible so we can improve the game!",
    ),
  ).toMatchSnapshot();
});

test("File upload component", () => {
  expect(FileUpload({ custom_id: "file_upload" })).toMatchSnapshot();
});

test("Radio group component", () => {
  expect(
    RadioGroup({
      custom_id: "satisfaction",
      options: [
        RadioGroupOption("Great", "great", { default: true }),
        RadioGroupOption("Okay", "okay"),
        RadioGroupOption("Needs work", "needs_work"),
      ],
      required: true,
    }),
  ).toMatchSnapshot();
});

test("Checkbox group component", () => {
  expect(
    CheckboxGroup({
      custom_id: "improvements",
      options: [Checkbox("Performance", "perf"), Checkbox("UI", "ui"), Checkbox("Docs", "docs", { default: true })],
      min_values: 1,
      max_values: 3,
      required: true,
    }),
  ).toMatchSnapshot();
});

test("Checkbox component", () => {
  expect(Checkbox({ custom_id: "subscribe" })).toMatchSnapshot();
});

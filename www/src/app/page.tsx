import Image from "next/image";
import Link from "next/link";
import { MarkdownAsync } from "react-markdown";
import { rehypePrettyCode } from "rehype-pretty-code";
import { BundleSizes } from "@/components/bundle-sizes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bun } from "@/components/ui/svgs/bun";
import { Chrome } from "@/components/ui/svgs/chrome";
import { CloudflareWorkers } from "@/components/ui/svgs/cloudflareWorkers";
import { DenoDark } from "@/components/ui/svgs/denoDark";
import { Firefox } from "@/components/ui/svgs/firefox";
import { GithubDark } from "@/components/ui/svgs/githubDark";
import { JSRWordmark } from "@/components/ui/svgs/jsrWordmark";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { NpmWordmark } from "@/components/ui/svgs/npmWordmark";
import { Safari } from "@/components/ui/svgs/safari";
import routes from "../../../packages/dressed/src/resources/make/data";

export default function Home() {
  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-4 py-10 text-center">
        <div className="relative">
          <Image
            src="/dressed.webp"
            alt="Blurred bg of logo"
            width={128}
            height={128}
            className="absolute top-0 left-0 -z-1 not-sm:scale-75 animate-[opacityUp_600ms_ease-in-out_forwards] blur"
          />
          <Image src="/dressed.webp" alt="Dressed logo" width={128} height={128} className="not-sm:scale-75" />
        </div>
        <h1 className="leading-tight">
          <Link href="#compare" className="font-medium text-[max(28px,min(4vw,56px))] text-primary hover:underline">
            Build Faster
          </Link>
          <br />
          <span className="font-bold text-[max(36px,min(5vw,72px))] text-white">Deploy Anywhere</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg sm:text-xl">A sleek, serverless-ready Discord API library.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button className="text-base" asChild size="lg">
            <Link href="/docs">Docs</Link>
          </Button>
          <div className="flex items-center">
            <Button title="NPM package" className="rounded-r-none border-r-0" variant="outline" size="lg" asChild>
              <Link href="https://npmjs.com/dressed" target="_blank" rel="noreferrer">
                <svg className="size-8" viewBox="0 0 128 128">
                  <title>NPM logo</title>
                  <rect x="2" y="38.5" width="124" height="43.71" fill="white" />
                  <NpmWordmark />
                </svg>
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-11" />
            <Button title="JSR package" className="rounded-l-none border-l-0" variant="outline" size="lg" asChild>
              <Link href="https://jsr.io/@dressed/dressed" target="_blank" rel="noreferrer">
                <JSRWordmark className="size-8" />
              </Link>
            </Button>
          </div>
          <Button title="GitHub repo" className="not-sm:hidden" variant="outline" size="icon-lg" asChild>
            <Link href="https://github.com/Inbestigator/dressed" target="_blank" rel="noreferrer">
              <GithubDark className="size-5" />
            </Link>
          </Button>
        </div>
      </main>
      <section id="stats" className="mx-auto -mt-12 flex items-center gap-4">
        <BundleSizes
          dressed={{ install: 450, min: 137, minzip: 33.7, version: "2.0.0-rc.3" }}
          others={{
            "discord.js": { install: 11300, min: 1100, minzip: 320.4, version: "14.26.4", sideEffects: true },
            "@buape/carbon": { install: 16590, min: 223.4, minzip: 53.4, version: "0.16.0", sideEffects: true },
            discordeno: { install: 6120, min: 248, minzip: 57.9, version: "21.0.0", sideEffects: true },
            droff: { install: 144670, min: 110.9, minzip: 28.7, version: "0.43.6", sideEffects: true },
            eris: { install: 2130, min: 776, minzip: 250.1, version: "0.18.0", sideEffects: true },
            "oceanic.js": { install: 7180, min: 93, minzip: 24.4, version: "1.14.0", sideEffects: true },
          }}
          defaultSelected="discord.js"
        />
        <Link href="/docs/resources" className="group flex items-center justify-center gap-0 text-lg">
          <span className="rounded-md border border-transparent bg-muted px-2 font-medium text-2xl transition-all">
            {Object.entries(routes).length}
          </span>
          <span className="whitespace-pre"> </span>
          <span className="group-hover:underline">API functions</span>
        </Link>
        <div className="flex gap-1 *:size-8">
          <div title="The core functions work in Browsers" className="flex size-fit! -space-x-2 *:size-8">
            <Firefox className="z-20" />
            <Chrome className="z-10" />
            <Safari />
          </div>
          <Bun />
          <DenoDark />
          <Nodejs />
          <CloudflareWorkers />
        </div>
      </section>
      <section
        id="compare"
        className="justify-center-safe extended-prose flex grid-cols-2 flex-col gap-2 p-4 pt-0 *:*:my-0! *:flex *:*:not-md:not-first:hidden *:flex-col *:gap-2 md:grid"
      >
        <div>
          <MarkdownAsync rehypePlugins={[[rehypePrettyCode, { theme: "slack-dark" }]]}>
            {`
\`\`\`ts title="Dressed" showLineNumbers
import { createMessage } from "dressed";
 
createMessage("<CHANNEL_ID>", "Hello from Dressed!");
\`\`\`
\`\`\`ts showLineNumbers{4}
import { createConnection } from "@dressed/ws";

const connection = createConnection({ intents: ["GuildMessages"] });

connection.onMessageCreate((message) => {
  if (message.author.bot) return;
  if (message.content === "ping") {
    createMessage(message.channel_id, "Pong!");
  }
});
\`\`\`
\`\`\`ts showLineNumbers{14}
import { ActionRow, Button, Container, TextDisplay } from "dressed";

createMessage("<CHANNEL_ID>", {
  components: [
    Container(
      TextDisplay("# Hello!\\nThis is a Components V2 message."),
      ActionRow(Button({ custom_id: "click_me", label: "Click me" })),
    ),
  ],
  flags: ["IsComponentsV2"],
});
\`\`\``}
          </MarkdownAsync>
          <details className="group not-md:order-last flex grow flex-col-reverse *:*:my-0! open:gap-2">
            <summary className="flex grow items-center justify-center rounded-lg border bg-green-500 p-2 text-center font-medium text-green-900 text-lg after:content-['Saved_16_lines…_that\'s_room_for_a_button_handler!_(Click_to_view)'] group-open:after:content-['Still_10_fewer_lines!']" />
            <div>
              <MarkdownAsync rehypePlugins={[[rehypePrettyCode, { theme: "slack-dark" }]]}>
                {`
\`\`\`ts showLineNumbers{25}
import { createInteraction } from "dressed/server";

connection.onInteractionCreate((interaction) => {
  if (interaction.type !== 3) return;
  return createInteraction(interaction).reply("You like efficient code!");
});
\`\`\`
      `}
              </MarkdownAsync>
            </div>
          </details>
        </div>
        <div>
          <MarkdownAsync rehypePlugins={[[rehypePrettyCode, { theme: "slack-dark" }]]}>
            {`
\`\`\`ts title="Every other library¹" showLineNumbers
const { Client } = require("library.js");

const client = new Client({ intents: ["GuildMessages"] });

client.once("ready", async () => {
  const channel = await client.channels.fetch("<CHANNEL_ID>");
  await channel.send("Hello");
});

client.login(process.env.DISCORD_TOKEN);
\`\`\`
\`\`\`ts showLineNumbers{11}
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.content === "ping") {
    message.channel.send("Pong!");
  }
});
\`\`\`
\`\`\`ts showLineNumbers{17}
const { ContainerBuilder, TextDisplayBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

client.once("ready", async () => {
  const channel = await client.channels.fetch("<CHANNEL_ID>");

  const container = new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent("# Hello!\\nThis is a Components V2 message.")
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("click_me")
          .setLabel("Click me")
          .setStyle(ButtonStyle.Primary)
      )
    );

  await channel.send({
    components: [container],
    flags: ["IsComponentsV2"],
  });
});
\`\`\``}
          </MarkdownAsync>
        </div>
      </section>
      <section className="z-10 -mt-3 px-4 text-[0.5rem] text-muted-foreground">
        ¹: "Every other library" refers to how <i>most</i> other libraries seem to follow the same syntax, as such
        Discord.js (the leading JavaScript library) was used to create the comparison snippets. Comparisons were created
        in good faith and may not use abolutely optimized code for either library. The name library.js was used in the
        first snippet as it is the most general, discord.js is later used to show that logic may be specific to the
        discord.js library.
      </section>
    </>
  );
}

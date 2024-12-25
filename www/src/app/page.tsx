import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Cloud, Code, Hexagon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DenoLogo from "@/components/deno-logo";
import JSRLogo from "@/components/jsr-logo";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col gap-8 items-center justify-center bg-background text-foreground py-10 px-4 max-w-5xl mx-auto text-center">
      <h1 className="animate-fade-in-up">
        <span className="block text-[max(28px,min(4vw,56px))] font-black leading-tight sm:leading-tight text-primary">
          Build Faster
        </span>
        <span className="block text-[max(36px,min(5vw,72px))] font-black leading-tight sm:leading-tight text-white">
          Deploy Anywhere
        </span>
      </h1>
      <p className="text-lg sm:text-xl max-w-2xl mx-auto animate-fade-in-up animation-delay-200 text-foreground">
        Discord-http is a powerful Discord.js alternative that leverages the
        Discord HTTP API, making it perfect for serverless deployments.
      </p>
      <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-400">
        <Button className="text-base" asChild size="lg">
          <Link href="/docs">Docs</Link>
        </Button>
        <Button
          title="JS Registry Entry"
          className="h-11"
          variant="outline"
          asChild
        >
          <Link
            href="https://jsr.io/@inbestigator/discord-http"
            target="_blank"
            rel="noreferrer"
          >
            <JSRLogo className="!size-8" />
          </Link>
        </Button>
        <div className="flex items-center">
          <Button
            title="Deno Example"
            className="rounded-r-none border-r-0 size-11"
            variant="outline"
            asChild
            size="icon"
          >
            <Link
              href="https://github.com/inbestigator/discord-http-example"
              target="_blank"
              rel="noreferrer"
            >
              <DenoLogo className="!size-5 bg-white rounded-full" />
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-11" />
          <Button
            title="Non Deno Example"
            className="rounded-l-none border-l-0 size-11"
            variant="outline"
            asChild
            size="icon"
          >
            <Link
              href="https://github.com/inbestigator/discord-http-example/tree/node"
              target="_blank"
              rel="noreferrer"
            >
              <Hexagon className="!size-5 text-[#689f63] fill-current" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8 text-left animate-fade-in-up animation-delay-600">
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Zap className="h-10 w-10 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2 text-card-foreground">
            Lightning Fast
          </h2>
          <p className="text-muted-foreground">
            Optimized for speed and efficiency using Discord&apos;s HTTP API.
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Cloud className="h-10 w-10 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2 text-card-foreground">
            Serverless Ready
          </h2>
          <p className="text-muted-foreground">
            Deploy effortlessly to serverless environments like{" "}
            <Link
              className="hover:underline underline-offset-2"
              href="https://deno.com/deploy"
              target="_blank"
            >
              Deno Deploy
            </Link>
            .
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Code className="h-10 w-10 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2 text-card-foreground">
            Developer Friendly
          </h2>
          <p className="text-muted-foreground">
            Simple API design, making bot development a breeze.
          </p>
        </div>
      </div>
    </div>
  );
}

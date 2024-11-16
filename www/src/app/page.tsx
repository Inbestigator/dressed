import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function Home() {
  return (
    <div className="py-10 min-h-dvh flex flex-col items-center justify-center text-center gap-10 max-w-5xl mx-auto">
      <h1 className="z-10 text-[max(36px,min(5vw,72px))] font-black leading-tight sm:leading-tight">
        The best{"  "}
        <Link
          href="https://deno.com/"
          target="_blank"
          rel="noreferrer"
          className="relative rounded bg-primary px-3 py-1 text-white hover:underline underline-offset-8 hidden sm:inline"
        >
          Deno
        </Link>{" "}
        framework for Discord HTTP bots.
      </h1>
      <p className="hidden sm:block">
        Discord-http is a Discord.js alternative that uses the Discord HTTP API,
        which makes it easy to deploy to serverless environments (like Deno
        Deploy).
      </p>
      <p className="sm:hidden">
        Discord-http is a Discord.js alternative that uses the Discord HTTP API.
      </p>
      <div className="flex flex-wrap justify-center gap-4 *:font-semibold *:text-base *:sm:text-lg *:sm:h-11 *:sm:rounded-md *:sm:px-8">
        <Button asChild>
          <Link href="/docs">Docs</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link
            href="https://github.com/inbestigator/discord-http"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ExternalLink className="sm:!size-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

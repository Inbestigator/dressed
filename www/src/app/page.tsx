import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookHeart, Cloud, Code, Hexagon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DenoLogo from "@/components/deno-logo";
import JSRLogo from "@/components/jsr-logo";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col gap-8 items-center justify-center py-10 px-4 max-w-5xl mx-auto text-center">
      <h1 className="block font-black leading-tight sm:leading-tight ">
        <span className="block text-[max(28px,min(4vw,56px))] text-primary">Build Faster</span>
        <span className="block text-[max(36px,min(5vw,72px))] text-white">Deploy Anywhere</span>
      </h1>
      <p className="text-lg sm:text-xl max-w-2xl mx-auto">
        A sleek, serverless-ready Discord bot framework.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button className="text-base" asChild size="lg">
          <Link href="/docs">Docs</Link>
        </Button>
        <Button title="JS Registry entry" className="h-11" variant="outline" asChild>
          <Link href="https://jsr.io/@dressed/dressed" target="_blank" rel="noreferrer">
            <JSRLogo className="!size-8" />
          </Link>
        </Button>
        <div className="flex items-center">
          <Button
            title="Deno examples"
            className="rounded-r-none border-r-0 size-11"
            variant="outline"
            asChild
            size="icon"
          >
            <Link
              href="https://github.com/inbestigator/dressed-examples/tree/main/deno/simple"
              target="_blank"
              rel="noreferrer"
            >
              <DenoLogo className="!size-5 bg-white rounded-full" />
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-11" />
          <Button
            title="All runtimes examples"
            className="rounded-l-none border-l-0 size-11"
            variant="outline"
            asChild
            size="icon"
          >
            <Link
              href="https://github.com/inbestigator/dressed-examples/tree/main/node"
              target="_blank"
              rel="noreferrer"
            >
              <Hexagon className="!size-5 text-[#689f63] fill-current" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8 text-left">
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <BookHeart className="h-10 w-10 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Anything, Anytime</h2>
          <p className="text-muted-foreground">Dressed has 100% support for the Discord API.</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Cloud className="h-10 w-10 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Serverless Ready</h2>
          <p className="text-muted-foreground">Deploy effortlessly to serverless environments.</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Code className="h-10 w-10 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Developer Friendly</h2>
          <p className="text-muted-foreground">
            Smart and simple API design, making bot development a breeze.
          </p>
        </div>
      </div>
    </div>
  );
}

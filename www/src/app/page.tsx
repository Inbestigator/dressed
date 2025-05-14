import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookDashed, BookHeart, Cloud, Code } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import JSRLogo from "@/components/jsr-logo";
import NPMLogo from "@/components/npm-logo";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col gap-8 items-center justify-center py-10 px-4 max-w-5xl mx-auto text-center">
      <h1 className="block font-black leading-tight sm:leading-tight ">
        <span className="block text-[max(28px,min(4vw,56px))] text-primary">
          Build Faster
        </span>
        <span className="block text-[max(36px,min(5vw,72px))] text-white">
          Deploy Anywhere
        </span>
      </h1>
      <p className="text-lg sm:text-xl max-w-2xl mx-auto">
        A sleek, serverless-ready Discord bot framework.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button className="text-base" asChild size="lg">
          <Link href="/docs">Docs</Link>
        </Button>
        <div className="flex items-center">
          <Button
            title="NPM package"
            className="h-11 rounded-r-none border-r-0"
            variant="outline"
            asChild
          >
            <Link
              href="https://www.npmjs.com/package/dressed"
              target="_blank"
              rel="noreferrer"
            >
              <NPMLogo className="!size-8" />
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-11" />
          <Button
            title="JSR package"
            className="h-11 rounded-l-none border-l-0"
            variant="outline"
            asChild
          >
            <Link
              href="https://jsr.io/@dressed/dressed"
              target="_blank"
              rel="noreferrer"
            >
              <JSRLogo className="!size-8" />
            </Link>
          </Button>
        </div>
        <Button
          title="Examples"
          className="size-11"
          variant="outline"
          asChild
          size="icon"
        >
          <Link
            href="https://github.com/inbestigator/dressed-examples"
            target="_blank"
            rel="noreferrer"
          >
            <BookDashed className="!size-5" />
          </Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-3 gap-8 text-left">
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <BookHeart className="h-10 w-10 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Anything, Anytime</h2>
          <p className="text-muted-foreground">
            Dressed has 100% support for the Discord API.
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Cloud className="h-10 w-10 mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Serverless Ready</h2>
          <p className="text-muted-foreground">
            Deploy effortlessly to serverless environments.
          </p>
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

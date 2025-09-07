import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookDashed } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import JSRLogo from "@/components/jsr-logo";
import NPMLogo from "@/components/npm-logo";
import Image from "next/image";

export default function Home() {
  return (
    <main className="my-auto flex flex-col gap-8 items-center justify-center py-10 px-4 max-w-5xl mx-auto text-center">
      <div className="relative">
        <Image
          src="/dressed.webp"
          alt="Blurred bg of logo"
          width={128}
          height={128}
          className="not-sm:scale-75 top-0 left-0 absolute -z-1 blur animate-[opacityUp_600ms_ease-in-out_forwards]"
        />
        <Image
          src="/dressed.webp"
          alt="Dressed logo"
          width={128}
          height={128}
          className="not-sm:scale-75"
        />
      </div>
      <h1 className="leading-tight">
        <span className="text-[max(28px,min(4vw,56px))] font-medium text-primary">
          Build Faster
        </span>
        <br />
        <span className="text-[max(36px,min(5vw,72px))] font-bold text-white">
          Deploy Anywhere
        </span>
      </h1>
      <p className="text-lg sm:text-xl max-w-2xl mx-auto text-muted-foreground">
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
          className="size-11 not-sm:hidden"
          variant="outline"
          asChild
          size="icon"
        >
          <Link
            href="https://github.com/Inbestigator/dressed-examples"
            target="_blank"
            rel="noreferrer"
          >
            <BookDashed className="!size-5" />
          </Link>
        </Button>
      </div>
    </main>
  );
}

import { BookDashed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import JSRLogo from "@/components/jsr-logo";
import NPMLogo from "@/components/npm-logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="mx-auto my-auto flex max-w-5xl flex-col items-center justify-center gap-8 px-4 py-10 text-center">
      <div className="relative">
        <Image
          src="/dressed.webp"
          alt="Blurred bg of logo"
          width={128}
          height={128}
          className="-z-1 absolute top-0 left-0 not-sm:scale-75 animate-[opacityUp_600ms_ease-in-out_forwards] blur"
        />
        <Image src="/dressed.webp" alt="Dressed logo" width={128} height={128} className="not-sm:scale-75" />
      </div>
      <h1 className="leading-tight">
        <span className="font-medium text-[max(28px,min(4vw,56px))] text-primary">Build Faster</span>
        <br />
        <span className="font-bold text-[max(36px,min(5vw,72px))] text-white">Deploy Anywhere</span>
      </h1>
      <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
        A sleek, serverless-ready Discord bot framework.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button className="text-base" asChild size="lg">
          <Link href="/docs">Docs</Link>
        </Button>
        <div className="flex items-center">
          <Button title="NPM package" className="h-11 rounded-r-none border-r-0" variant="outline" asChild>
            <Link href="https://www.npmjs.com/package/dressed" target="_blank" rel="noreferrer">
              <NPMLogo className="!size-8" />
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-11" />
          <Button title="JSR package" className="h-11 rounded-l-none border-l-0" variant="outline" asChild>
            <Link href="https://jsr.io/@dressed/dressed" target="_blank" rel="noreferrer">
              <JSRLogo className="!size-8" />
            </Link>
          </Button>
        </div>
        <Button title="Examples" className="not-sm:hidden size-11" variant="outline" asChild size="icon">
          <Link href="https://github.com/Inbestigator/dressed-examples" target="_blank" rel="noreferrer">
            <BookDashed className="!size-5" />
          </Link>
        </Button>
      </div>
    </main>
  );
}

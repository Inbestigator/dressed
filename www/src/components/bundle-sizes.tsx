"use client";

import Link from "next/link";
import { useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function BundleSizes<
  const T extends Record<string, { install: number; min: number; minzip: number; version: string; sideEffects?: true }>,
>({
  dressed,
  others,
  defaultSelected,
}: {
  dressed: { install: number; min: number; minzip: number; version: string };
  others: T;
  defaultSelected: keyof T;
}) {
  const [selected, setSelected] = useState(defaultSelected);
  const other = others[selected];
  const comparison = Math.max(other.install, other.min, dressed.min);
  const smaller = Math.min(dressed.install / other.install, dressed.min / other.min, dressed.minzip / other.minzip);
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <DropdownMenu>
        <HoverCardTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="group flex items-center justify-center gap-0 text-lg pl-0">
              <span className="rounded-md border not-group-hover:bg-muted px-2 font-medium text-2xl transition-all group-hover:border-transparent">
                {(100 - smaller * 100).toFixed(1)}%
              </span>
              <span className="whitespace-pre"> </span>
              <span>
                smaller {dressed.install > other.install && "bundle"} than{" "}
                <span className="text-foreground/80">{selected.toString()}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
        </HoverCardTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Library</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={selected.toString()} onValueChange={(v) => setSelected(v)}>
            {Object.keys(others).map((k) => (
              <DropdownMenuRadioItem key={k} value={k}>
                {k}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
        <HoverCardContent className="grid w-fit grid-cols-[auto_1fr] gap-1 text-right font-mono text-sm leading-4.5 *:*:h-4.5">
          <BundleEntry
            name="dressed"
            version={dressed.version}
            install={dressed.install}
            min={dressed.min}
            minzip={dressed.minzip}
            comparison={comparison}
          />
          <BundleEntry
            name={selected.toString()}
            version={other.version}
            install={other.install}
            min={other.min}
            minzip={other.minzip}
            comparison={comparison}
            sideEffects={other.sideEffects}
          />
        </HoverCardContent>
      </DropdownMenu>
    </HoverCard>
  );
}

function BundleEntry({
  name,
  version,
  install,
  min,
  minzip,
  comparison,
  sideEffects,
}: {
  name: string;
  version: string;
  install: number;
  min: number;
  minzip: number;
  comparison: number;
  sideEffects?: true;
}) {
  const minzipPercent = minzip / comparison;
  const minPercent = min / comparison - minzipPercent;
  const installPercent = install / comparison - minzipPercent - minPercent;
  return (
    <Link href={`https://bundlephobia.com/package/${name}@${version}`} className="contents" target="_blank">
      <p title={`${name}@${version}`}>{name}</p>
      <div className="flex items-center">
        <div
          title={`Minified and Gzipped size (${minzip}KB)`}
          className="block h-full rounded-l-md bg-[#65a1f8]"
          style={{ width: `calc(var(--spacing) * ${minzipPercent * 64})` }}
        />
        <div
          title={`Minified size (${min}KB)`}
          className="block h-full bg-[#65c3f8]"
          style={{ width: `calc(var(--spacing) * ${minPercent * 64})` }}
        />
        <div
          title={`Install size (${install > 1000 ? `${install / 1000}MB` : `${install}KB`})`}
          className="block h-full rounded-r-md bg-[#579e4b]"
          style={{ width: `calc(var(--spacing) * ${installPercent * 64})` }}
        />
        <div className="translate-x-1">
          {!sideEffects && (
            <svg
              width="calc(var(--spacing) * 4)"
              height="calc(var(--spacing) * 4)"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Was marked side-effect free</title>
              <g fillRule="nonzero" fill="none">
                <path
                  className="side-effect-icon-svg__circle"
                  d="M9.65 6.54a3.12 3.12 0 1 0 .01 6.24 3.12 3.12 0 0 0 0-6.24zm0 .7a2.42 2.42 0 1 1 0 4.84 2.42 2.42 0 1 1 0-4.85z"
                  stroke="#C8CDD3"
                  fill="#C8CDD3"
                />
                <path
                  className="side-effect-icon-svg__arrows"
                  d="M6.2 6.54a.38.38 0 0 0 .34-.38v-3.2a.38.38 0 1 0-.75 0v2.29L1.65 1.1a.38.38 0 0 0-.54.53L5.26 5.8H2.98a.38.38 0 1 0 0 .75H6.2zM17.06 6.54a.38.38 0 1 0-.04-.75h-2.28l4.15-4.15a.38.38 0 1 0-.54-.53l-4.14 4.14V2.97a.38.38 0 1 0-.75 0v3.2c0 .2.17.37.38.37h3.22zM1.4 19c.1 0 .19-.05.26-.12l4.13-4.14v2.29a.38.38 0 1 0 .75 0v-3.2c0-.2-.17-.37-.38-.37H2.98a.38.38 0 1 0 0 .75h2.28l-4.14 4.14a.38.38 0 0 0 .28.65zM18.65 19a.38.38 0 0 0 .23-.65l-4.14-4.14h2.28a.38.38 0 1 0 0-.75h-3.18c-.21 0-.38.17-.38.38v3.19a.38.38 0 1 0 .75 0v-2.29l4.13 4.14c.08.09.2.13.31.12z"
                  stroke="#90DD97"
                  strokeWidth="0.5"
                  fill="#90DD97"
                />
              </g>
            </svg>
          )}
        </div>
      </div>
    </Link>
  );
}

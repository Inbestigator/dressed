import { readdirSync, readFileSync, statSync } from "node:fs";
import DocsMD from "@/components/docs-md";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function generateStaticParams() {
  return readDir("content").map((s) => ({ slug: s.slug }));
}

const banner = `> [!IMPORTANT]
> Currently the documentation here pertains to the canary tag of Dressed (\`dressed@1.10.0-canary.5.x\`), keep in mind that some items (especially talked about in the [deployment guides](/docs/guide/deploying)) are not available / work slightly differently in the \`@latest\` version.

`;

function readDir(path: string) {
  const files: { slug: string[]; content: string }[] = [];
  const dir = readdirSync(path);

  for (const file of dir) {
    const stat = statSync(`${path}/${file}`);
    if (stat.isDirectory()) {
      files.push(...readDir(`${path}/${file}`));
    } else {
      files.push({
        slug: `${path.split("content/")[1] ?? ""}/${file.split(".")[0]}`.split("/").filter((v) => v !== ""),
        content: banner + readFileSync(`${path}/${file}`, "utf-8"),
      });
    }
  }

  return files;
}

export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const slug = (await params).slug;
  let doc: { slug: string[]; content: string } | undefined;

  try {
    doc = readDir("content").find((s) => s.slug.join("/") === slug.join("/"));
  } catch {}

  if (!doc) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center gap-10 max-w-5xl mx-auto">
        <h1 className="z-10 text-3xl font-black leading-tight sm:text-7xl sm:leading-tight">404</h1>
        <p>Page not found.</p>
      </div>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {doc.slug.map((s, i) => {
                if (i === doc.slug.length - 1) {
                  return (
                    <BreadcrumbItem key={s}>
                      <BreadcrumbPage>
                        {s
                          .split("-")
                          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                          .join(" ")}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  );
                }
                return (
                  <div key={s} className=" gap-2.5 items-center hidden md:flex">
                    <BreadcrumbItem>
                      <BreadcrumbLink href={`/docs/${doc.slug.slice(0, i + 1).join("/")}`}>
                        {s
                          .split("-")
                          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                          .join(" ")}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="p-4 pt-0 max-w-screen">
        <DocsMD content={doc.content} />
      </main>
    </>
  );
}

import Link from "next/link";
import { MarkdownAsync } from "react-markdown";
import rehypeCallouts from "rehype-callouts";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkGfm from "remark-gfm";

function DocsAnchor({ href, target, children, ...a }: Readonly<React.AnchorHTMLAttributes<HTMLAnchorElement>>) {
  return (
    <Link href={href ?? "#"} target={target ?? (href?.startsWith("http") ? "_blank" : undefined)} {...a}>
      {children}
    </Link>
  );
}

export default function DocsMD({ content }: Readonly<{ content: string }>) {
  return (
    <div className="extended-prose">
      <MarkdownAsync
        rehypePlugins={[[rehypePrettyCode, { theme: "slack-dark" }], rehypeSlug, rehypeUnwrapImages, rehypeCallouts]}
        remarkPlugins={[remarkGfm]}
        components={{ a: DocsAnchor }}
      >
        {content}
      </MarkdownAsync>
    </div>
  );
}

import { MarkdownAsync } from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypePrettyCode from "rehype-pretty-code";

export default function DocsMD({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none">
      <MarkdownAsync
        rehypePlugins={[
          [rehypePrettyCode, { theme: "catppuccin-mocha" }],
          rehypeSlug,
          rehypeUnwrapImages,
        ]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </MarkdownAsync>
    </div>
  );
}

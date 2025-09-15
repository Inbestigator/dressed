import { MarkdownAsync } from "react-markdown";
import rehypeCallouts from "rehype-callouts";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkGfm from "remark-gfm";

export default function DocsMD({ content }: { content: string }) {
  return (
    <div className="extended-prose">
      <MarkdownAsync
        rehypePlugins={[
          [rehypePrettyCode, { theme: "slack-dark" }],
          rehypeSlug,
          rehypeUnwrapImages,
          rehypeCallouts,
        ]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </MarkdownAsync>
    </div>
  );
}

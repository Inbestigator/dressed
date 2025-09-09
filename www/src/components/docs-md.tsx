import { MarkdownAsync } from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeCallouts from "rehype-callouts";

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

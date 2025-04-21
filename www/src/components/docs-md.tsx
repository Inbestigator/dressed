import Markdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypeHighlight from "rehype-highlight";

export default function DocsMD({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none">
      <Markdown
        rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeUnwrapImages]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </Markdown>
    </div>
  );
}

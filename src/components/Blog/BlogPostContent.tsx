import DOMPurify from "isomorphic-dompurify";

type BlogPostContentProps = {
  body: string;
};

function isHtmlContent(body: string) {
  return /<[a-z][\s\S]*>/i.test(body.trim());
}

function plainTextToHtml(text: string) {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export default function BlogPostContent({ body }: BlogPostContentProps) {
  const rawHtml = isHtmlContent(body) ? body : plainTextToHtml(body);

  const safeHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
  });

  return (
    <div
      className="blog-article-body text-base leading-relaxed text-gray-700 dark:text-zinc-300
        [&_a]:font-semibold [&_a]:text-lime-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-lime-700 dark:[&_a]:text-lime-400 dark:hover:[&_a]:text-lime-300
        [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-lime-500 [&_blockquote]:bg-black/5 [&_blockquote]:py-4 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-gray-600 dark:[&_blockquote]:bg-black/40 dark:[&_blockquote]:text-zinc-400
        [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:uppercase [&_h2]:italic [&_h2]:tracking-tight [&_h2]:text-gray-900 dark:[&_h2]:text-white
        [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 dark:[&_h3]:text-white
        [&_img]:my-8 [&_img]:w-full [&_img]:rounded-none [&_img]:border [&_img]:border-black/10 dark:[&_img]:border-white/10
        [&_li]:mb-2 [&_li]:text-gray-700 dark:[&_li]:text-zinc-300
        [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6
        [&_p]:mb-5 [&_p]:leading-[1.8]
        [&_strong]:font-bold [&_strong]:text-gray-900 dark:[&_strong]:text-white
        [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}

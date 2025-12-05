import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 className="mb-4 text-2xl font-bold">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-6 text-xl font-bold">{children}</h2>,
          h3: ({ children }) => <h3 className="mb-2 mt-4 text-lg font-semibold">{children}</h3>,

          p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,

          ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,

          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="bg-background/20 rounded px-1.5 py-0.5 font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className={`${className} bg-background/20 block overflow-x-auto rounded-lg p-4 font-mono text-sm`}
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="bg-background/20 mb-4 overflow-x-auto rounded-lg p-4">{children}</pre>,

          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto">
              <table className="border-background/30 min-w-full border-collapse border">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-background/10">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-background/20 border-b">{children}</tr>,
          th: ({ children }) => (
            <th className="border-background/30 border px-4 py-2 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => <td className="border-background/30 border px-4 py-2">{children}</td>,

          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-4 border-primary pl-4 italic">{children}</blockquote>
          ),

          hr: () => <hr className="border-background/30 my-6" />,

          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

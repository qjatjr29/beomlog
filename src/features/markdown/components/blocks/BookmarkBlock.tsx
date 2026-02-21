import { BookmarkBlockProps } from "../../types";

export const BookmarkBlock = ({ url, title }: BookmarkBlockProps) => {
  const domain = new URL(url).hostname.replace("www.", "");
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block my-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blog-primary hover:shadow-md transition-all bg-white dark:bg-gray-800 no-underline"
    >
      <div className="flex items-center gap-3">
        <img
          src={favicon}
          alt=""
          className="w-8 h-8 rounded shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate mb-0.5">
            {title}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {domain}
          </div>
        </div>
        <svg
          className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
    </a>
  );
};

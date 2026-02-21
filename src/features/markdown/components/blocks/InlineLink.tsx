import { InlineLinkProps } from "../../types";

export const InlineLink = ({ url, domain }: InlineLinkProps) => {
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 my-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors no-underline font-medium"
      style={{ boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" }}
    >
      <img
        src={favicon}
        alt=""
        className="w-4 h-4 shrink-0 rounded-sm"
        onError={(e) => {
          e.currentTarget.src =
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="16" height="16"%3E%3Crect fill="%2393c5fd" width="16" height="16" rx="2"/%3E%3Ctext fill="%232563eb" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="10"%3E🔗%3C/text%3E%3C/svg%3E';
        }}
      />
      <span>{domain}</span>
      <svg
        className="w-3.5 h-3.5 opacity-60"
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
    </a>
  );
};

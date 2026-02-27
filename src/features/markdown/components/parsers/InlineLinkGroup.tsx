interface InlineLinkGroupProps {
  items: { url: string; domain: string }[];
}

export const InlineLinkGroup = ({ items }: InlineLinkGroupProps) => {
  if (items.length === 1) {
    // 링크 1개면 기존 InlineLink 스타일 유지
    const { url, domain } = items[0];
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    return (
      <div className="my-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-blue-700 dark:text-blue-300 transition-colors no-underline font-medium"
        >
          <img
            src={favicon}
            alt=""
            className="w-4 h-4 shrink-0 rounded-sm"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span>{domain}</span>
          <ExternalLinkIcon />
        </a>
      </div>
    );
  }

  // 링크 2개 이상 → 박스 안에 ul/li
  return (
    <div className="my-4 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          References
        </span>
      </div>
      <ul className="divide-y divide-blue-100 dark:divide-blue-900/30">
        {items.map(({ url, domain }, i) => {
          const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
          return (
            <li key={i}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors no-underline group"
              >
                <img
                  src={favicon}
                  alt=""
                  className="w-4 h-4 shrink-0 rounded-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-sm text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200 truncate flex-1 font-medium">
                  {domain}
                </span>
                <span className="text-[10px] text-blue-400 dark:text-blue-500 truncate flex-1 hidden sm:block">
                  {url.replace(/^https?:\/\//, "").substring(0, 50)}
                  {url.length > 60 ? "..." : ""}
                </span>
                <ExternalLinkIcon className="w-3.5 h-3.5 text-blue-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const ExternalLinkIcon = ({
  className = "w-3.5 h-3.5 opacity-60",
}: {
  className?: string;
}) => (
  <svg
    className={className}
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
);

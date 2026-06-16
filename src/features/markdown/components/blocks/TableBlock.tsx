import { TableBlockProps } from "../../types";
import { parseInlineMarkdown } from "../../utils/parser";

export const TableBlock = ({ headers, rows }: TableBlockProps) => (
  <div className="overflow-x-auto my-6 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
    <table className="w-full text-left border-collapse">
      <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
        <tr>
          {headers.map((header, i) => (
            <th
              key={i}
              className="px-4 py-2.5 font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap border-r border-gray-300 dark:border-gray-600 last:border-r-0"
            >
              {parseInlineMarkdown(header)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
        {rows.map((row, i) => (
          <tr
            key={i}
            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {row.map((cell, j) => (
              <td
                key={j}
                className="px-4 py-3 text-gray-700 dark:text-gray-300 break-keep leading-relaxed border-r border-gray-300 dark:border-gray-600 last:border-r-0"
              >
                {parseInlineMarkdown(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

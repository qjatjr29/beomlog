import { TableBlockProps } from "../../types";
import { parseInlineMarkdown } from "../../utils/parser";

export const TableBlock = ({ headers, rows }: TableBlockProps) => (
  <table className="w-full my-6 border-collapse">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        {headers.map((header, i) => (
          <th
            key={i}
            className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium text-gray-900 dark:text-gray-100"
          >
            {parseInlineMarkdown(header)}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
          {row.map((cell, j) => (
            <td
              key={j}
              className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300"
            >
              {parseInlineMarkdown(cell)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

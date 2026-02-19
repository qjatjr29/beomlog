import { JSX } from "react";

interface TableState {
  inTable: boolean;
  tableLines: string[];
}

export const parseTable = (
  line: string,
  state: TableState,
  index: number,
  TableBlock: any,
): {
  element?: JSX.Element;
  shouldReturn: boolean;
  newState: TableState;
} => {
  if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
    if (!state.inTable) {
      return {
        shouldReturn: true,
        newState: {
          inTable: true,
          tableLines: [line],
        },
      };
    } else {
      return {
        shouldReturn: true,
        newState: {
          ...state,
          tableLines: [...state.tableLines, line],
        },
      };
    }
  }

  if (state.inTable && !line.trim().startsWith("|")) {
    if (state.tableLines.length < 2) {
      return {
        shouldReturn: false,
        newState: {
          inTable: false,
          tableLines: [],
        },
      };
    }

    const rows = state.tableLines.map((line) => {
      const cells = line.split("|");
      return cells.slice(1, cells.length - 1).map((cell) => cell.trim());
    });

    const headers = rows[0];
    const dataRows = rows.slice(2);

    return {
      element: (
        <TableBlock key={`table-${index}`} headers={headers} rows={dataRows} />
      ),
      shouldReturn: false,
      newState: {
        inTable: false,
        tableLines: [],
      },
    };
  }

  if (state.inTable) {
    return { shouldReturn: true, newState: state };
  }

  return { shouldReturn: false, newState: state };
};

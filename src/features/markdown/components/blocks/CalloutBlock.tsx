import { parseInlineMarkdown } from "../../utils/parser";

interface CalloutBlockProps {
  lines: string[];
}

export const CalloutBlock = ({ lines }: CalloutBlockProps) => {
  const renderLine = (line: string, i: number) => {
    // 번호 리스트 (1. 2. 3.)
    const orderedMatch = line.match(/^(\d+)\. (.*)/);
    if (orderedMatch) {
      return (
        <div key={i} className="flex gap-2">
          <span className="shrink-0 text-gray-500 min-w-[1.2rem] text-right">
            {orderedMatch[1]}.
          </span>
          <span className="leading-relaxed">
            {parseInlineMarkdown(orderedMatch[2])}
          </span>
        </div>
      );
    }

    // 불릿 리스트 (- )
    const bulletMatch = line.match(/^- (.*)/);
    if (bulletMatch) {
      return (
        <div key={i} className="flex gap-2">
          <span className="shrink-0 text-gray-400">•</span>
          <span className="leading-relaxed">
            {parseInlineMarkdown(bulletMatch[1])}
          </span>
        </div>
      );
    }

    // callout 내부 중첩 인용 (> prefix — callout 안의 리스트가 > 로 저장된 경우)
    if (line.startsWith("> ")) {
      return (
        <div
          key={i}
          className="pl-3 border-l-2 border-gray-200 leading-relaxed"
        >
          {parseInlineMarkdown(line.substring(2))}
        </div>
      );
    }

    // 빈 줄 — 문단 사이 약간의 여백만
    if (line.trim() === "") {
      return <div key={i} className="h-2" />;
    }

    // 첫 줄 = 아이콘 + 제목
    if (i === 0) {
      return (
        <div key={i} className="font-medium leading-relaxed">
          {parseInlineMarkdown(line)}
        </div>
      );
    }

    // 일반 텍스트
    return (
      <div key={i} className="leading-relaxed text-gray-600 dark:text-gray-400">
        {parseInlineMarkdown(line)}
      </div>
    );
  };

  // 연속된 리스트 아이템들을 하나의 그룹으로 묶기
  const groupedLines: {
    type: "list" | "single";
    lines: string[];
    startIndex: number;
  }[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const isListItem = /^(\d+)\. /.test(line) || /^- /.test(line);
    if (isListItem) {
      const group: string[] = [line];
      let j = i + 1;
      while (
        j < lines.length &&
        (/^(\d+)\. /.test(lines[j]) || /^- /.test(lines[j]))
      ) {
        group.push(lines[j]);
        j++;
      }
      groupedLines.push({ type: "list", lines: group, startIndex: i });
      i = j;
    } else {
      groupedLines.push({ type: "single", lines: [line], startIndex: i });
      i++;
    }
  }

  return (
    <div className="my-4 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {groupedLines.map((group, gi) => {
          if (group.type === "list") {
            // 리스트 그룹 — 내부 간격 좁게
            return (
              <div key={gi} className={`space-y-0.5 ${gi > 0 ? "mt-1" : ""}`}>
                {group.lines.map((line, li) =>
                  renderLine(line, group.startIndex + li),
                )}
              </div>
            );
          }
          // 단일 줄
          return (
            <div
              key={gi}
              className={gi > 0 && group.lines[0].trim() !== "" ? "mt-2" : ""}
            >
              {renderLine(group.lines[0], group.startIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

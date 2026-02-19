import { useEffect, useRef, useState } from "react";

export const MarqueeText = ({
  text,
  className,
  animate = true,
}: {
  text: string;
  className?: string;
  animate?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const measureEl = measureRef.current;
    if (!container || !measureEl) return;

    const check = () => {
      // 텍스트 너비가 컨테이너보다 큰지 확인
      setIsOverflow(measureEl.offsetWidth > container.clientWidth);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(container);
    return () => observer.disconnect();
  }, [text]);

  const shouldAnimate = isOverflow && animate;

  return (
    <div
      ref={containerRef}
      // 핵심: shouldAnimate가 아닐 때(텍스트가 짧을 때) justify-center 적용
      className={`overflow-hidden relative flex items-center font-semibold ${
        shouldAnimate ? "justify-start" : "justify-center"
      } ${className}`}
    >
      <span
        ref={measureRef}
        className="absolute invisible whitespace-nowrap pointer-events-none"
        aria-hidden
      >
        {text}
      </span>

      <span
        className={
          shouldAnimate
            ? "inline-block animate-marquee whitespace-nowrap"
            : "block truncate text-center w-full" // 넘치지 않을 때 텍스트를 중앙으로
        }
      >
        {text}
        {shouldAnimate && <span className="px-8">{text}</span>}
      </span>
    </div>
  );
};

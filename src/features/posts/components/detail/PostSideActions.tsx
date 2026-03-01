import { useEffect, useState } from "react";
import { Check, Share2, ChevronUp, ChevronDown } from "lucide-react";

export const PostSideActions = () => {
  const [scrollY, setScrollY] = useState(0);
  const [docHeight, setDocHeight] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      setDocHeight(document.documentElement.scrollHeight - window.innerHeight);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("input");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const showUp = scrollY > 300;
  const showDown = docHeight > 300 && scrollY < docHeight - 100;

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2">
      <button
        onClick={handleShare}
        className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 border-2 ${
          copied
            ? "bg-green-500 border-green-600"
            : "bg-blog-primary border-blog-primary-hover hover:bg-blog-primary-hover"
        } text-white`}
        title={copied ? "복사됨!" : "링크 복사"}
      >
        {copied ? (
          <Check className="w-5 h-5" />
        ) : (
          <Share2 className="w-5 h-5" />
        )}
      </button>

      {showUp && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 bg-blog-primary hover:bg-blog-primary-hover text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 border-2 border-blog-primary-hover"
          title="맨 위로"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {showDown && (
        <button
          onClick={() =>
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: "smooth",
            })
          }
          className="w-12 h-12 bg-blog-primary hover:bg-blog-primary-hover text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 border-2 border-blog-primary-hover"
          title="맨 아래로"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

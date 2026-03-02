interface VideoBlockProps {
  url: string;
  caption?: string;
  type: "youtube" | "vimeo" | "file" | "external";
  videoId?: string;
}

export const VideoBlock = ({
  url,
  caption,
  type,
  videoId,
}: VideoBlockProps) => {
  if (type === "youtube" && videoId) {
    return (
      <div className="my-6">
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={caption || "YouTube video"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
          />
        </div>
        {caption && (
          <p className="text-center text-xs text-gray-400 mt-2">{caption}</p>
        )}
      </div>
    );
  }

  if (type === "vimeo" && videoId) {
    return (
      <div className="my-6">
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            title={caption || "Vimeo video"}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
          />
        </div>
        {caption && (
          <p className="text-center text-xs text-gray-400 mt-2">{caption}</p>
        )}
      </div>
    );
  }

  if (type === "file") {
    return (
      <div className="my-6">
        <video
          src={url}
          controls
          className="w-full max-w-2xl mx-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
        >
          브라우저가 video 태그를 지원하지 않습니다.
        </video>
        {caption && (
          <p className="text-center text-xs text-gray-400 mt-2">{caption}</p>
        )}
      </div>
    );
  }

  // 기타 외부 링크 (Vimeo도 아니고 YouTube도 아닌)
  return (
    <div className="my-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-blog-primary hover:underline text-sm"
      >
        🎥 {caption || url}
      </a>
    </div>
  );
};

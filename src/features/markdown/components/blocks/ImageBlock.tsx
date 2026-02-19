import { ImageBlockProps } from "../../types";

export const ImageBlock = ({ src, alt, width, height }: ImageBlockProps) => {
  return (
    <div className="my-6 flex justify-center">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="max-w-full md:max-w-2xl w-auto h-auto rounded-lg border border-gray-200 shadow-sm"
        style={{ maxWidth: "min(650px, 100%)", maxHeight: "450px" }}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src =
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3E이미지를 불러올 수 없습니다%3C/text%3E%3C/svg%3E';
          e.currentTarget.className = "border-2 border-red-200";
        }}
      />
    </div>
  );
};

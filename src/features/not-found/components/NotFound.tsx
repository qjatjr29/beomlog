import { Link } from "react-router";
import { Home } from "lucide-react";

export const NotFound = () => {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-3xl mb-4 text-gray-800">페이지를 찾을 수 없습니다</h1>
      <p className="text-gray-600 mb-8">
        요청하신 페이지가 존재하지 않거나 삭제되었습니다.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blog-primary to-blog-border text-white rounded-full hover:shadow-lg transition-shadow"
      >
        <Home className="w-5 h-5" />
        홈으로 돌아가기
      </Link>
    </div>
  );
};

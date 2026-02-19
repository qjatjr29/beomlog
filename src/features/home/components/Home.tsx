import { Link } from "react-router";
import { Book } from "lucide-react";
import { MiniRoom } from "../../mini-room/components";
import { usePosts } from "../../../contexts/PostsContext";
import { POSTS_PER_PAGE } from "@/shared/constants";
import { getCategoryIcon } from "@/shared/utils/post.utils";
import { Pagination } from "@/shared/components/Pagination";
import { usePagination } from "@/shared/hooks/usePagination";
import { usePostStorage } from "@/features/posts/hooks/usePostStorage";
import { PostCard } from "@/features/posts/components/PostCard";

export const Home = () => {
  const { getAllCategories, getCategoryStats } = usePosts();
  const { filteredPosts: allPosts, viewCounts } = usePostStorage();

  const {
    currentPage,
    totalPages,
    currentItems: currentPosts,
    handlePageChange,
  } = usePagination(allPosts, POSTS_PER_PAGE);

  const categories = getAllCategories();
  return (
    <div>
      <MiniRoom />
      {/* 카테고리 그리드 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const { count, topTags } = getCategoryStats(category.name);

          return (
            <div
              key={category.name}
              className="bg-linear-to-br from-blog-light to-blog-gradient-end border-2 border-blog-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-black" />
                  <div>
                    <h3 className="text-sm text-gray-800">{category.name}</h3>
                  </div>
                </div>
                <div className="bg-blog-primary text-white px-2 py-1 rounded text-xs font-medium">
                  {count}개
                </div>
              </div>

              {topTags.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {topTags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/posts/${category.name}`}
                        className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:border-blog-primary hover:bg-blog-light transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <Link
                to={`/posts/${category.name}`}
                className="block text-center px-4 py-2 bg-blog-primary hover:bg-blog-primary-hover text-white rounded text-xs transition-colors"
              >
                {category.name} 글 모아보기 →
              </Link>
            </div>
          );
        })}
      </div>

      {/* 전체 게시물 목록 헤더 */}
      <div className="mb-6 pb-4 border-b-2 border-dotted border-gray-300">
        <h1 className="text-lg flex items-center gap-2 font-bold">
          <Book className="w-5 h-5 text-blog-primary" />
          전체 게시물
          <span className="text-blog-primary">({allPosts.length})</span>
        </h1>
      </div>

      <div className="space-y-3 mb-8">
        {currentPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            viewCount={viewCounts[post.id] ?? 0}
            selectedTag={null}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <div className="text-center mt-8">
        <Link to="/guestbook" className="...">
          💌 방명록 남기기
        </Link>
      </div>
    </div>
  );
};

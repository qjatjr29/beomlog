import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { usePosts } from "../../../../contexts/PostsContext";
import { usePostNavigation } from "../../hooks/usePostNavigation";
import { MarkdownRenderer } from "../../../markdown/components/MarkdownRenderer";
import { CommentSection } from "../../../guestbook/components";
import { incrementPostViews } from "../../../../data/storage/post.storage";
import { PostSideActions } from "./PostSideActions";
import { PostHeader } from "./PostHeader";
import { PostNavigation } from "./PostNavigation";
import { GroupSidebar } from "./GroupSidebar";
import { loadGroupById } from "../../utils/group-loader";

export const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getPostById, posts } = usePosts();
  const post = getPostById(id!);
  const { prevPost, nextPost } = usePostNavigation(id!);

  const [views, setViews] = useState<number>(() => {
    if (!id) return 0;
    const today = new Date().toISOString().split("T")[0];
    const cached = localStorage.getItem(`postView_${id}_${today}`);
    return cached ? parseInt(cached) : (post?.views ?? 0);
  });

  useEffect(() => {
    if (!id) return;
    incrementPostViews(id).then(setViews);
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
        <h1 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-200">
          글을 찾을 수 없습니다 😢
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          요청하신 포스트가 존재하지 않거나 삭제되었을 수 있습니다.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blog-primary text-white rounded-md hover:bg-blog-primary-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const group = post.groupId ? loadGroupById(post.groupId) : null;
  const groupPosts = post.groupId
    ? posts.filter((p) => p.groupId === post.groupId)
    : [];

  return (
    // fixed 사이드바이므로 flex 불필요, 기존 단순 구조로
    <div className="w-full max-w-full overflow-hidden relative">
      <PostSideActions />

      <Link
        to={`/posts/${post.category}`}
        className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blog-primary mb-6 text-sm transition-colors no-underline group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">목록으로</span>
      </Link>

      {/* GroupSidebar: fixed라 여기 위치 무관하게 뷰포트 기준으로 표시됨 */}
      {group && groupPosts.length > 1 && (
        <GroupSidebar
          currentPost={post}
          group={group}
          groupPosts={groupPosts}
        />
      )}

      <PostHeader post={post} views={views} />
      <article className="w-full overflow-hidden mb-16 prose prose-slate max-w-none">
        <MarkdownRenderer content={post.content} />
      </article>
      <PostNavigation prevPost={prevPost} nextPost={nextPost} />
      <div className="mt-12">
        <CommentSection postId={id!} title="댓글" iconType="comment" />
      </div>
    </div>
  );
};

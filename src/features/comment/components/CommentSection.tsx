import { useState, useEffect } from "react";
import { MessageSquare, BookHeart, PencilLine, X } from "lucide-react";
import { getComments, saveComment, deleteComment } from "@/data/storage";
import { Comment, CommentSectionProps } from "../types";
import { COMMENTS_PER_PAGE, GUESTBOOK_PER_PAGE } from "../constants";
import { useAdmin } from "@/contexts/AdminContext";
import { usePagination } from "@/shared/hooks/usePagination";
import { Pagination } from "@/shared/components/Pagination";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { AlertModal } from "@/shared/components/AlertModal";
import { DeleteConfirmModal } from "../../../shared/components/DeleteConfirmModal";

export const CommentSection = ({
  postId,
  title,
  iconType,
  pageSize = iconType === "comment" ? COMMENTS_PER_PAGE : GUESTBOOK_PER_PAGE,
}: CommentSectionProps) => {
  const { isAdminMode, adminPassword } = useAdmin();
  const [items, setItems] = useState<Comment[]>([]);
  const [formData, setFormData] = useState({
    author: "",
    password: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(iconType !== "comment");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    id: "",
    isOpen: false,
    password: "",
  });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  const { currentPage, totalPages, currentItems, handlePageChange, resetPage } =
    usePagination(items, pageSize, { scrollToTop: false });

  useEffect(() => {
    loadItems();
    resetPage();
  }, [postId]);

  const loadItems = async () => {
    const loaded = await getComments(postId);
    setItems(loaded);
  };

  const showError = (message: string) =>
    setErrorModal({ isOpen: true, message });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { author, password, content } = formData;
    if (!isAdminMode && (!author.trim() || !password.trim() || !content.trim()))
      return showError("모든 필드를 입력해주세요.");
    if (isAdminMode && !content.trim())
      return showError("내용을 입력해주세요.");

    setIsSubmitting(true);
    const newItem: Comment = {
      id: Date.now().toString(),
      postId,
      author: isAdminMode ? "Beomsic" : author.trim(),
      password: isAdminMode ? adminPassword : password.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isAdmin: isAdminMode,
    };

    if (!(await saveComment(newItem))) {
      showError("저장에 실패했습니다.");
    } else {
      setFormData({ author: "", password: "", content: "" });
      if (iconType === "comment") setIsFormOpen(false);
      await loadItems();
      resetPage();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const pw = isAdminMode ? adminPassword : deleteModal.password;
    const result = await deleteComment(deleteModal.id, pw);
    if (result.success) {
      setDeleteModal({ id: "", isOpen: false, password: "" });
      await loadItems();
    } else {
      showError(
        result.reason === "wrong_password"
          ? "비밀번호가 틀렸습니다."
          : "오류 발생",
      );
    }
    setIsDeleting(false);
  };

  const CommentIcon = iconType === "comment" ? MessageSquare : BookHeart;

  return (
    <div className={iconType === "comment" ? "mt-12" : ""}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-dotted border-gray-300">
        <h2 className="text-lg flex items-center gap-2 font-bold">
          <CommentIcon className="w-5 h-5 text-blog-primary" />
          {title} <span className="text-blog-primary">({items.length})</span>
        </h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            isFormOpen
              ? "bg-gray-200 text-gray-600"
              : "bg-blog-primary text-white shadow-sm hover:bg-blog-primary-hover"
          }`}
        >
          {isFormOpen ? (
            <>
              <X className="w-3.5 h-3.5" /> 닫기
            </>
          ) : (
            <>
              <PencilLine className="w-3.5 h-3.5" />{" "}
              {iconType === "comment" ? "댓글 쓰기" : "방명록 남기기"}
            </>
          )}
        </button>
      </div>

      <CommentForm
        isOpen={isFormOpen}
        isAdminMode={isAdminMode}
        isSubmitting={isSubmitting}
        iconType={iconType}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />

      <div className="space-y-3 min-h-25">
        {items.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            {iconType === "comment"
              ? "첫 댓글을 남겨보세요! 💬"
              : "아직 방명록이 없어요. 첫 번째로 한마디 남겨주세요! 😎"}
          </div>
        ) : (
          currentItems.map((item) => (
            <CommentItem
              key={item.id}
              item={item}
              isAdminMode={isAdminMode}
              Icon={CommentIcon}
              onDelete={(id) =>
                setDeleteModal({ ...deleteModal, id, isOpen: true })
              }
            />
          ))
        )}
      </div>

      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        isAdminMode={isAdminMode}
        isDeleting={isDeleting}
        passwordValue={deleteModal.password}
        onPasswordChange={(val) =>
          setDeleteModal({ ...deleteModal, password: val })
        }
        onClose={() =>
          setDeleteModal({ ...deleteModal, isOpen: false, password: "" })
        }
        onConfirm={handleDelete}
      />

      <AlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
      />
    </div>
  );
};

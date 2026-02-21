import { motion, AnimatePresence } from "framer-motion";
import { UserStar } from "lucide-react";
import { Button, Input, Textarea } from "@/shared/components/ui";

interface CommentFormProps {
  isOpen: boolean;
  isAdminMode: boolean;
  isSubmitting: boolean;
  iconType: "comment" | "guestbook";
  formData: { author: string; password: string; content: string };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CommentForm = ({
  isOpen,
  isAdminMode,
  isSubmitting,
  iconType,
  formData,
  setFormData,
  onSubmit,
}: CommentFormProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
        animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <form
          onSubmit={onSubmit}
          className="bg-blog-lightest dark:bg-gray-800 border border-blog-border dark:border-gray-600 p-5 rounded-xl shadow-sm"
        >
          {isAdminMode ? (
            <div className="flex items-center gap-2 mb-3 px-1">
              <UserStar className="w-4 h-4 text-blog-primary" />
              <span className="text-sm font-bold text-blog-primary">
                Beomsic
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input
                placeholder="이름"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className="bg-white dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 dark:placeholder-gray-400 h-9 text-sm"
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-white dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 dark:placeholder-gray-400 h-9 text-sm"
              />
            </div>
          )}
          <Textarea
            placeholder={
              iconType === "comment"
                ? "댓글을 입력하세요..."
                : "따뜻한 한마디를 남겨주세요..."
            }
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            rows={3}
            className="bg-white dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 dark:placeholder-gray-400 mb-3 text-sm resize-none"
          />
          <div className="flex justify-end">
            <Button
              disabled={isSubmitting}
              className="bg-blog-primary text-white px-8 h-10 rounded-lg font-bold hover:bg-blog-primary-hover"
            >
              {isSubmitting ? "등록 중..." : "등록하기"}
            </Button>
          </div>
        </form>
      </motion.div>
    )}
  </AnimatePresence>
);

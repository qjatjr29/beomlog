import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "@/shared/components/ui";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  isAdminMode: boolean;
  isDeleting: boolean;
  passwordValue: string;
  onPasswordChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal = ({
  isOpen,
  isAdminMode,
  isDeleting,
  passwordValue,
  onPasswordChange,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-xs shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-gray-800 dark:text-gray-100 font-bold mb-1">
            삭제하시겠습니까?
          </h3>
          {!isAdminMode ? (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                비밀번호를 입력해 주세요.
              </p>
              <Input
                type="password"
                value={passwordValue}
                onChange={(e) => onPasswordChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onConfirm()}
                className="mb-4 h-10"
                placeholder="비밀번호"
                autoFocus
              />
            </>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              관리자 권한으로 삭제합니다.
            </p>
          )}
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              className="flex-1 bg-gray-400 dark:bg-gray-600 text-white h-10"
            >
              취소
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-500 text-white h-10"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

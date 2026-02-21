import { TriangleAlert } from "lucide-react";
import { Button } from "@/shared/components/ui";

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export const AlertModal = ({ isOpen, message, onClose }: AlertModalProps) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-xs shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <TriangleAlert className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-gray-800 dark:text-gray-100 font-bold">알림</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
          {message}
        </p>
        <Button
          onClick={onClose}
          className="w-full bg-blog-primary text-white h-10 hover:bg-blog-primary-hover"
        >
          확인
        </Button>
      </div>
    </div>
  );
};

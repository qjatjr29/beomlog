import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button, Input } from "./ui";
import { PasswordModalProps } from "../types";

export const PasswordModal = ({
  show,
  passwordInput,
  passwordError,
  onPasswordChange,
  onSubmit,
  onClose,
}: PasswordModalProps) => {
  const [showPassword, setShowPassword] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 border-2 border-blog-border">
        <h3 className="text-lg mb-4 text-gray-800">관리자 인증</h3>
        <form onSubmit={onSubmit}>
          <div className="relative mb-2">
            <Input
              type={showPassword ? "text" : "password"}
              value={passwordInput}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="pr-9"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-red-500 mb-3">{passwordError}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blog-primary hover:bg-blog-primary-hover"
            >
              확인
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

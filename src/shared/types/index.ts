export interface VisitorStats {
  today: number;
  total: number;
}

export interface PasswordModalProps {
  show: boolean;
  passwordInput: string;
  passwordError: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface PaginationOptions {
  scrollToTop?: boolean;
}

export interface PostNavigationResult {
  prevPost: { id: string; title: string } | null;
  nextPost: { id: string; title: string } | null;
}

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

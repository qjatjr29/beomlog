export interface BGMTrack {
  id: string;
  videoId: string;
  title: string;
  orderIndex: number;
}

export interface BgmFormProps {
  initialUrl?: string;
  initialTitle?: string;
  error?: string;
  onSubmit: (url: string, title: string) => void;
  onCancel: () => void;
  submitLabel: string;
}

export interface BGMPlayerProps {
  isAdminMode?: boolean;
}

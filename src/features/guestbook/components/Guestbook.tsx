import { GuestbookSection } from "./GuestbookSection";

export const Guestbook = () => (
  <div>
    <div className="mb-6 pb-4 border-b-2 border-dotted border-gray-300 dark:border-gray-600">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        자유롭게 메시지를 남겨주세요!
      </p>
    </div>
    <GuestbookSection />
  </div>
);

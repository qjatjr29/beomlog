import { GuestbookSection } from "./GuestbookSection";

export const Guestbook = () => {
  return (
    <div>
      <div className="mb-6 pb-4 border-b-2 border-dotted border-gray-300">
        <p className="text-xs text-gray-500">자유롭게 메시지를 남겨주세요!</p>
      </div>

      <GuestbookSection />
    </div>
  );
};

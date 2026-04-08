import { MessageCircle } from "lucide-react";

export default function FloatingSupport() {
  const waUrl = "https://wa.me/249116458724?text=" + encodeURIComponent("مرحباً، أحتاج مساعدة من فريق دعم EGARK");

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-colors animate-fade-in"
      aria-label="تواصل مع الدعم عبر واتساب"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

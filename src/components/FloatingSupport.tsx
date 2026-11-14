import { MessageCircle } from "lucide-react";

export default function FloatingSupport() {
  const waUrl = "https://wa.me/249116458724?text=" + encodeURIComponent("مرحباً، أحتاج مساعدة من فريق دعم EGARK");

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="support-link fixed left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-success text-success-foreground shadow-lg hover:bg-success/90 transition-colors md:bottom-6 md:left-6 md:h-14 md:w-14"
      aria-label="تواصل مع الدعم عبر واتساب"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

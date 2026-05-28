import { MessageCircle } from "lucide-react";

export const WhatsAppFab = () => (
  <a
    href="https://wa.me/918124995343"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat on WhatsApp"
    className="fixed bottom-6 right-6 z-50 group"
  >
    <div className="absolute inset-0 rounded-full gradient-gold-bg blur-xl opacity-70 animate-pulse-glow" />
    <div className="relative h-14 w-14 rounded-full gradient-gold-bg flex items-center justify-center shadow-gold transition-transform group-hover:scale-110">
      <MessageCircle className="h-6 w-6 text-background" strokeWidth={2.5} />
    </div>
  </a>
);

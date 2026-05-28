import logo from "@/assets/logo.png";

export const ShopLogo = ({ className = "h-12 w-12", glow = true }: { className?: string; glow?: boolean }) => (
  <div className={`relative inline-flex items-center justify-center ${className}`}>
    {glow && (
      <div className="absolute inset-0 rounded-full blur-2xl opacity-60 gradient-gold-bg animate-pulse-glow" />
    )}
    <img
      src={logo}
      alt="Sri Madheshwara Mobiles logo"
      className="relative h-full w-full object-contain drop-shadow-[0_0_18px_rgba(212,175,55,0.45)]"
    />
  </div>
);

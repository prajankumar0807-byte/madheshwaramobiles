import { useEffect, useState } from "react";

export const TypingSlogan = ({ phrases }: { phrases: string[] }) => {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = phrases[i % phrases.length];
    const t = setTimeout(() => {
      if (!del) {
        const next = cur.slice(0, text.length + 1);
        setText(next);
        if (next === cur) setTimeout(() => setDel(true), 1600);
      } else {
        const next = cur.slice(0, text.length - 1);
        setText(next);
        if (next === "") { setDel(false); setI(i + 1); }
      }
    }, del ? 40 : 70);
    return () => clearTimeout(t);
  }, [text, del, i, phrases]);
  return (
    <span className="gradient-gold-text font-display">
      {text}
      <span className="inline-block w-[2px] h-[1em] align-middle bg-gold ml-1 animate-pulse" />
    </span>
  );
};

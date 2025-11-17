import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  className = "",
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [ripples, setRipples] = useState<JSX.Element[]>([]);

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2; // ensure ripple covers whole button
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = (
      <span
        key={Date.now()}
        style={{
          width: size,
          height: size,
          left: x,
          top: y,
        }}
        className="absolute bg-primary/30 pointer-events-none rounded-full animate-rippleScale"
        onAnimationEnd={() =>
          setRipples((prev) => prev.filter((r) => r.key !== newRipple.key))
        }
      />
    );

    setRipples((prev) => [...prev, newRipple]);
  };

  return (
    <button
      ref={buttonRef}
      onMouseEnter={createRipple}
      className={cn(
        `relative overflow-hidden ${className} hover:bg-chatPrimary hover:text-secondary dark:text-secondary-foreground text-foreground font-medium text-lg bg-secondary inline-block w-fit border border-border hover:scale-[102%] ease-in-out duration-500 rounded-full px-8 py-3 h-full transition-all`
      )}
      {...props}
    >
      {children}
      {ripples.map((r) => r)}
    </button>
  );
};

export default RippleButton;

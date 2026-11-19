import { type ReactNode, useState } from 'react';

interface Cta3DButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'dark' | 'light';
  size?: 'md' | 'lg';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}

export function Cta3DButton({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  type = 'button',
  disabled = false,
  className = '',
}: Cta3DButtonProps) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [pressed, setPressed] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-y * 10).toFixed(2)),
      ry: Number((x * 12).toFixed(2)),
    });
  };

  const resetTilt = () => {
    setTilt({ rx: 0, ry: 0 });
    setPressed(false);
  };

  const palette =
    variant === 'primary'
      ? {
          face: 'bg-[#16B981] hover:bg-[#1EC98E] text-[#091936] border-[#6EE7B7]/60',
          lip: 'bg-[#0C7D56]',
          shadow: 'shadow-[0_14px_28px_-8px_rgba(22,185,129,0.42)]',
        }
      : variant === 'dark'
      ? {
          face: 'bg-[#102A56] hover:bg-[#163770] dark:bg-[#1E293B] dark:hover:bg-[#273549] text-white border-white/15',
          lip: 'bg-[#071631] dark:bg-[#090E1A]',
          shadow: 'shadow-[0_14px_28px_-8px_rgba(16,42,86,0.42)]',
        }
      : {
          face: 'bg-white hover:bg-[#F8FAFC] dark:bg-[#1E293B] dark:hover:bg-[#273549] text-[#102A56] dark:text-white border-slate-200 dark:border-slate-700',
          lip: 'bg-slate-300 dark:bg-[#090E1A]',
          shadow: 'shadow-[0_12px_24px_-8px_rgba(16,42,86,0.16)]',
        };

  const sizing =
    size === 'lg'
      ? 'min-h-[52px] px-7 py-3.5 text-base'
      : 'min-h-[42px] px-5 py-2.5 text-sm';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onPointerDown={() => {
        if (!disabled) setPressed(true);
      }}
      onPointerUp={() => setPressed(false)}
      style={{
        transform: `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(${
          pressed ? '4px' : '0px'
        })`,
      }}
      className={`group relative inline-flex items-center justify-center rounded-xl transition-transform duration-150 ease-out select-none whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16B981] ${
        disabled ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer'
      } ${palette.shadow} ${className}`}
    >
      {/* 3D Extruded Depth Base */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 -bottom-1.5 h-full rounded-xl transition-all duration-150 ${
          palette.lip
        } ${pressed ? 'translate-y-[-3px]' : 'translate-y-0'}`}
      />
      {/* 3D Top Tactile Face */}
      <span
        className={`relative z-10 w-full rounded-xl border font-bold inline-flex items-center justify-center gap-2.5 transition-colors duration-150 ${sizing} ${palette.face}`}
      >
        {children}
      </span>
    </button>
  );
}

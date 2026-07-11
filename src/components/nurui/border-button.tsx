import { cn } from "@/lib/utils";

const BorderAnimationButton = ({ text , className, children }: { text: string , className?: string, children?: React.ReactNode }) => {
  return (
    <div className={cn("relative inline-flex h-12 active:scale-95 transistion overflow-hidden rounded-lg p-[1px] focus:outline-none", className)}>
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#e7029a_0%,#f472b6_50%,#bd5fff_100%)]"></span>
      <p className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-7 text-sm font-medium text-white backdrop-blur-3xl gap-2 undefined">
        {children}
        <span>{text}</span>
      </p>
    </div>
  );
};

export default BorderAnimationButton;

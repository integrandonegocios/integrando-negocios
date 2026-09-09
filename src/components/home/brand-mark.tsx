type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-9 place-items-center rounded-xl bg-brand-primary text-sm font-black text-text-primary shadow-sm ${className}`}
    >
      IN
    </span>
  );
}

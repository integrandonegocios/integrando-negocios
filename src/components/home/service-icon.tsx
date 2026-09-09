export type ServiceIconName = "site" | "page" | "marketing" | "social" | "identity" | "systems" | "automation" | "ai";

type ServiceIconProps = {
  name: ServiceIconName;
};

function IconPaths({ name }: ServiceIconProps) {
  switch (name) {
    case "site":
      return <><rect height="15" rx="2" width="19" x="2.5" y="4.5" /><path d="M2.5 8.5h19M6 6.5h.01M9 6.5h.01M7.5 13l2-2 2 2 3.5-3.5 2.5 2.5" /></>;
    case "page":
      return <><path d="M6 2.5h8l4 4v15H6zM14 2.5v4h4" /><path d="M9 12h6M9 16h4" /></>;
    case "marketing":
      return <><path d="m4 14 1.2 4.7a2 2 0 0 0 2.4 1.4l1.4-.4L7.5 14" /><path d="M3 9.5v3A1.5 1.5 0 0 0 4.5 14H8l8 4V4L8 8H4.5A1.5 1.5 0 0 0 3 9.5ZM19 8a4 4 0 0 1 0 6" /></>;
    case "social":
      return <><path d="M7.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM16.5 12a3 3 0 1 0 0-6" /><path d="M2 20a5.5 5.5 0 0 1 11 0M14 14.5a5 5 0 0 1 8 4" /></>;
    case "identity":
      return <><path d="M12 2.5 14.7 9l6.8 3-6.8 3L12 21.5 9.3 15l-6.8-3 6.8-3z" /><path d="m18.5 3 .7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" /></>;
    case "systems":
      return <><rect height="13" rx="2" width="19" x="2.5" y="3.5" /><path d="M8 21h8M12 16.5V21M6.5 7.5h4M6.5 11h7" /></>;
    case "automation":
      return <><path d="M20 7h-5V2M4 17h5v5" /><path d="M18.3 5.7A8.5 8.5 0 0 0 5 8M5.7 18.3A8.5 8.5 0 0 0 19 16" /><path d="M12 8.5v3.8l2.5 1.5" /></>;
    case "ai":
      return <><rect height="14" rx="3" width="14" x="5" y="5" /><path d="M9 9h6v6H9zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></>;
  }
}

export function ServiceIcon({ name }: ServiceIconProps) {
  return (
    <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-lg border border-brand-primary-light bg-brand-primary-subtle text-brand-accent transition duration-300 group-hover:border-brand-primary/35 group-hover:bg-brand-primary-light">
      <svg className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
        <IconPaths name={name} />
      </svg>
    </span>
  );
}

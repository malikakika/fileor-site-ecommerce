import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  rightAdornment?: React.ReactNode;
};

export default function AccordionSection({
  title,
  defaultOpen = false,
  rightAdornment,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border rounded-lg bg-white">
      <header
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div onClick={(e) => e.stopPropagation()}>{rightAdornment}</div>
      </header>
      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
}

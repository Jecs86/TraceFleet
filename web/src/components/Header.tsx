import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="h-20 bg-surface flex items-center justify-between px-8 shadow-sm z-10 border-b border-border shrink-0">
      <h2 className="text-2xl font-bold text-text-heading uppercase tracking-wide">{title}</h2>
      <button className="relative p-2 text-text-muted hover:bg-card rounded-full transition-colors">
        <Bell className="w-6 h-6" />
        <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
    </header>
  );
}

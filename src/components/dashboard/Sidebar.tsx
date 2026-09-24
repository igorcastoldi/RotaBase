'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  Mountain, LayoutDashboard, ClipboardList, Settings,
  Compass, Ticket, LogOut, MapPinned, PlusCircle, Calendar, Map
} from 'lucide-react';

interface Props {
  role: string;
  userName: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  empresa: [
    { href: '/dashboard/empresa', label: 'Painel', icon: LayoutDashboard },
    { href: '/dashboard/empresa/reservas', label: 'Reservas', icon: ClipboardList },
    { href: '/dashboard/empresa/passeios', label: 'Meus Passeios', icon: Map },
    { href: '/dashboard/empresa/passeios/novo', label: 'Adicionar Passeio', icon: PlusCircle },
    { href: '/dashboard/empresa/horarios', label: 'Horários', icon: Calendar },
    { href: '/dashboard/empresa/configuracoes', label: 'Configurações', icon: Settings },
  ],
  guia: [
    { href: '/dashboard/guia', label: 'Painel', icon: LayoutDashboard },
    { href: '/dashboard/guia/lotes', label: 'Meus Lotes', icon: MapPinned },
    { href: '/dashboard/guia/passeios', label: 'Meus Passeios', icon: Map },
    { href: '/dashboard/guia/passeios/novo', label: 'Adicionar Passeio', icon: PlusCircle },
    { href: '/dashboard/guia/horarios', label: 'Horários', icon: Calendar },
  ],
  cliente: [
    { href: '/dashboard/cliente', label: 'Minhas Reservas', icon: Ticket },
    { href: '/explorar', label: 'Explorar', icon: Compass },
  ],
};

export default function Sidebar({ role, userName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient();
  const items = NAV_BY_ROLE[role] ?? NAV_BY_ROLE.cliente;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-stone-200 min-h-screen hidden md:flex flex-col">
      <div className="p-5 border-b border-stone-100">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-stone-900">
          <Mountain className="w-6 h-6 text-amber-500" /> RotaBase
        </Link>
      </div>

      <div className="p-4 border-b border-stone-100">
        <p className="text-xs text-stone-400">Conectado como</p>
        <p className="font-semibold text-stone-800 truncate">{userName}</p>
        <p className="text-xs text-amber-600 capitalize">{role.replace('_', ' ')}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active ? 'bg-amber-50 text-amber-700' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-stone-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600 transition w-full"
        >
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </div>
    </aside>
  );
}

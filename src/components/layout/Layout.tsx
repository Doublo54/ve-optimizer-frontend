import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}

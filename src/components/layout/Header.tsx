import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Vote } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-6 flex h-16 items-center max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-sky-600 text-white">
            <Vote className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold text-neutral-900">veToken Voting Optimizer</h1>
        </div>
        <div className="ml-auto">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

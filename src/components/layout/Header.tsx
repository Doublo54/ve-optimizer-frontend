import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Vote } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-2">
          <Vote className="h-6 w-6" />
          <h1 className="text-lg font-semibold">veToken Voting Optimizer</h1>
        </div>
        <div className="ml-auto">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

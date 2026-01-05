import { useOptimizerStore } from '../stores/optimizerStore';
import { ChainType } from '../types/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const CHAINS: { value: ChainType; label: string }[] = [
  { value: 'base', label: 'Base' },
  { value: 'linea', label: 'Linea' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'unichain', label: 'Unichain' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'arbitrum', label: 'Arbitrum' },
];

export function ChainSelector() {
  const { selectedChain, setChain } = useOptimizerStore();

  return (
    <div className="space-y-2.5">
      <label htmlFor="chain-select" className="text-sm font-medium text-neutral-700">Chain</label>
      <Select value={selectedChain} onValueChange={(value: ChainType) => setChain(value)}>
        <SelectTrigger id="chain-select" className="w-full">
          <SelectValue placeholder="Select chain" />
        </SelectTrigger>
        <SelectContent>
          {CHAINS.map((chain) => (
            <SelectItem key={chain.value} value={chain.value}>
              {chain.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

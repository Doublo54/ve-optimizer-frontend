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
    <div className="space-y-2">
      <label className="text-sm font-medium">Chain</label>
      <Select value={selectedChain} onValueChange={(value: ChainType) => setChain(value)}>
        <SelectTrigger className="w-[180px]">
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

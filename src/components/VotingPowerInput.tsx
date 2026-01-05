import { useOptimizerStore } from '../stores/optimizerStore';
import { Input } from './ui/input';

export function VotingPowerInput() {
  const { votingPower, setVotingPower } = useOptimizerStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setVotingPower(value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        veToken Voting Power (ETH)
      </label>
      <Input
        type="number"
        value={votingPower}
        onChange={handleChange}
        min="0"
        step="0.1"
        placeholder="25.5"
        className="w-[180px]"
      />
      <p className="text-xs text-muted-foreground">
        Your locked veToken voting power in ETH
      </p>
    </div>
  );
}

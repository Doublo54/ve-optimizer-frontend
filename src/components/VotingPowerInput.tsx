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
    <div className="space-y-2.5">
      <label htmlFor="voting-power" className="text-sm font-medium text-neutral-700">
        Voting Power (ETH)
      </label>
      <Input
        id="voting-power"
        type="number"
        value={votingPower}
        onChange={handleChange}
        min="0"
        step="0.1"
        placeholder="25.5"
        className="w-full"
      />
      <p className="text-xs text-neutral-500">
        Your locked veToken voting power
      </p>
    </div>
  );
}

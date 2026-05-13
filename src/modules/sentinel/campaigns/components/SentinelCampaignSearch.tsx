import { Search } from "lucide-react";
import { Input } from "src/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const SentinelCampaignSearch = ({ value, onChange }: Props) => {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search by campaign code or title..." className="pl-9" />

    </div>
  );
};

export default SentinelCampaignSearch;
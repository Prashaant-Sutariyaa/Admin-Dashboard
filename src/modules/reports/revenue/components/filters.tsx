import { useState } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "src/components/ui/select";

import { Button } from "src/components/ui/button";

import {
    Download,
    Filter,
    RotateCcw,
} from "lucide-react";

import { DateRange } from "react-day-picker";

import { CAMPAIGN_STATUS_OPTIONS } from "src/config/constant-data/campaignOptions";

import DateRangePicker from "src/components/ui/DateRangePicker";
import { toApiDate } from "src/utils/toApiDate";
import MultiSelect from "src/components/ui/Multiselect";
import Can from "src/permissions/CanPermission";

interface Props {
    clients: { label: string; value: string; }[];

    onApply: (filters: {
        client_id?: string;
        status?: string;
        from_date?: string;
        to_date?: string;
    }) => void;

    onDownload: (filters: {
        client_id?: string;
        status?: string;
        from_date?: string;
        to_date?: string;
    }) => void;
    downloading: boolean;
    hasData: boolean;
}

const RevenueFilters = ({ clients, onApply, onDownload, downloading, hasData }: Props) => {

    const [status, setStatus] = useState("all");
    const [clientIds, setClientIds] = useState<string[]>([]);
    const [range, setRange] = useState<DateRange | undefined>();
    const hasFilters = status !== "all" || clientIds.length > 0 || !!range?.from || !!range?.to;

    const handleApply = () => {
        onApply({
            status: status !== "all" ? status : undefined,
            client_id: clientIds.length ? clientIds.join(",") : undefined,
            from_date: toApiDate(range?.from),
            to_date: toApiDate(range?.to),
        });
    };

    const handleReset = () => {
        setStatus("all");
        setClientIds([]);
        setRange(undefined);
        onApply({});
    };

    const handleDownload = () => {
        onDownload({
            status: status !== "all" ? status : undefined,
            client_id: clientIds.length ? clientIds.join(",") : undefined,
            from_date: toApiDate(range?.from),
            to_date: toApiDate(range?.to),
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-lightprimary/30 dark:bg-white/5 p-4">
            <Select value={status} onValueChange={setStatus} >
                <SelectTrigger className="w-44 bg-background">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {CAMPAIGN_STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value} > {s.label} </SelectItem>
                    ))}
                </SelectContent>

            </Select>

            <div className="w-72">
                <MultiSelect options={clients} value={clientIds} onChange={setClientIds} placeholder="Select clients" maxDisplay={2} />
            </div>

            <div>
                <DateRangePicker value={range} onChange={setRange} placeholder="Select date range" />
            </div>
            <div className="ml-auto flex items-center gap-2">
                <Button variant="lightprimary" onClick={handleApply} className="flex items-center gap-2">
                    <Filter size={16} />
                    Apply
                </Button>
                <Button variant="lighterror" onClick={handleReset} disabled={!hasFilters} className="flex items-center gap-2">
                    <RotateCcw size={16} />
                    Reset
                </Button>
                <Can module="revenue" actions={['download']}>
                    <Button variant="lightprimary" onClick={handleDownload} disabled={downloading || !hasData} className="flex items-center gap-2">
                        <Download size={16} />
                        {downloading ? "Downloading..." : "Download"}
                    </Button>
                </Can>

            </div>

        </div>
    );
};

export default RevenueFilters;
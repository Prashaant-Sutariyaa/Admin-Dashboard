import { useEffect, useState } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "src/components/ui/select";

import { Button } from "src/components/ui/button";

import {
    Search,
} from "lucide-react";

import { DateRange } from "react-day-picker";

import { CAMPAIGN_STATUS_OPTIONS } from "src/config/constant-data/campaignOptions";

import DateRangePicker from "src/components/ui/DateRangePicker";

import { Input } from "src/components/ui/input";

import Can from "src/permissions/CanPermission";
import { toApiDate } from "src/utils/toApiDate";

interface Props {

    onApply: (filters: {
        status?: string;
        search?: string;
        start_date?: string;
        end_date?: string;
    }) => void;

    onCreate: () => void;
}

const CampaignFilters = ({
    onApply,
    onCreate,
}: Props) => {

    const [status, setStatus] =
        useState("all");

    const [search, setSearch] =
        useState("");

    const [debouncedSearch, setDebouncedSearch] =
        useState("");

    const [range, setRange] =
        useState<DateRange | undefined>();

    // ✅ SEARCH DEBOUNCE
    useEffect(() => {

        const timer =
            setTimeout(() => {

                setDebouncedSearch(
                    search
                );

            }, 500);

        return () =>
            clearTimeout(timer);

    }, [search]);

    // ✅ AUTO APPLY
    useEffect(() => {

        onApply({

            status:
                status !== "all"
                    ? status
                    : undefined,

            search:
                debouncedSearch.trim()
                    ? debouncedSearch
                    : undefined,

            start_date:
                range?.from
                    ? toApiDate(range.from)
                    : undefined,

            end_date:
                range?.to
                    ? toApiDate(range.to)
                    : undefined,
        });

    }, [
        status,
        debouncedSearch,
        range,
    ]);

    return (

        <div className=" flex flex-wrap items-center gap-3 rounded-xl border border-border bg-lightprimary/30 dark:bg-white/5 p-4">

            <div className="relative">
                <Search size={16} className=" absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none " />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaign name or code..."
                    className="w-[280px] pl-9 bg-background" />

            </div>

            <Select value={status} onValueChange={setStatus} >
                <SelectTrigger className="w-[180px] bg-background " >
                    <SelectValue placeholder="Filter Status " />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all"> All Status </SelectItem>
                    {CAMPAIGN_STATUS_OPTIONS.map(
                        (item) => (
                            <SelectItem key={item.value} value={item.value} >{item.label}</SelectItem>
                        )
                    )}
                </SelectContent>
            </Select>
            <div>
                <DateRangePicker value={range} onChange={setRange} placeholder="Select date range" />
            </div>
            <div className="ml-auto">
                <Can module="campaign" actions={['create']} >
                    <Button variant="lightprimary" onClick={onCreate} >Create Campaign</Button>
                </Can>
            </div>
        </div>
    );
};

export default CampaignFilters;
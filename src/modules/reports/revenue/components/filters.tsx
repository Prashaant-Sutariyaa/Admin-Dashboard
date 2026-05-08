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

import AutoComplete from "src/components/ui/AutoComplete";
import DateRangePicker from "src/components/ui/DateRangePicker";
import { toApiDate } from "src/utils/toApiDate";

interface Props {
    clients: {
        label: string;
        value: string;
    }[];

    onApply: (filters: {
        client_id?: number;
        status?: string;
        from_date?: string;
        to_date?: string;
    }) => void;

    onDownload: (filters: {
        client_id?: number;
        status?: string;
        from_date?: string;
        to_date?: string;
    }) => void;

    downloading: boolean;

    hasData: boolean;
}

const RevenueFilters = ({
    clients,
    onApply,
    onDownload,
    downloading,
    hasData,
}: Props) => {

    const [status, setStatus] = useState("all");

    const [clientId, setClientId] = useState("all");

    const [range, setRange] = useState<DateRange | undefined>();

    // ✅ active filters
    const hasFilters =
        status !== "all" ||
        clientId !== "all" ||
        !!range?.from ||
        !!range?.to;

    // ✅ apply
    const handleApply = () => {

        onApply({
            status:
                status !== "all"
                    ? status
                    : undefined,

            client_id:
                clientId !== "all"
                    ? Number(clientId)
                    : undefined,

            from_date: toApiDate(range?.from),
            to_date: toApiDate(range?.to),
        });
    };

    // ✅ reset
    const handleReset = () => {

        setStatus("all");

        setClientId("all");

        setRange(undefined);

        onApply({});
    };

    // ✅ download
    const handleDownload = () => {

        onDownload({
            status:
                status !== "all"
                    ? status
                    : undefined,

            client_id:
                clientId !== "all"
                    ? Number(clientId)
                    : undefined,

            from_date: toApiDate(range?.from),
            to_date: toApiDate(range?.to),
        });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-lightprimary/30 dark:bg-white/5 p-4">

            {/* STATUS */}
            <Select
                value={status}
                onValueChange={setStatus}
            >

                <SelectTrigger className="w-44 bg-background">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>

                    <SelectItem value="all">
                        All Status
                    </SelectItem>

                    {CAMPAIGN_STATUS_OPTIONS.map((s) => (
                        <SelectItem
                            key={s.value}
                            value={s.value}
                        >
                            {s.label}
                        </SelectItem>
                    ))}

                </SelectContent>

            </Select>

            {/* CLIENT */}
            <div className="w-72">

                <AutoComplete
                    options={[
                        {
                            label: "All Clients",
                            value: "all",
                        },

                        ...clients,
                    ]}

                    value={clientId}

                    onChange={(v) => {
                        setClientId(v || "all");
                    }}

                    placeholder="Search client..."
                />

            </div>

            {/* DATE RANGE */}
            <div className="w-[320px]">

                <DateRangePicker
                    value={range}
                    onChange={setRange}
                    placeholder="Select date range"
                />

            </div>

            {/* ACTIONS */}
            <div className="ml-auto flex items-center gap-2">

                {/* APPLY */}
                <Button
                    variant="lightprimary"
                    onClick={handleApply}
                    className="flex items-center gap-2"
                >
                    <Filter size={16} />
                    Apply
                </Button>

                {/* RESET */}
                <Button
                    variant="lighterror"
                    onClick={handleReset}
                    disabled={!hasFilters}
                    className="flex items-center gap-2"
                >
                    <RotateCcw size={16} />
                    Reset
                </Button>

                {/* DOWNLOAD */}
                <Button
                    variant="lightprimary"
                    onClick={handleDownload}
                    disabled={downloading || !hasData}
                    className="flex items-center gap-2"
                >
                    <Download size={16} />

                    {downloading
                        ? "Downloading..."
                        : "Download"}
                </Button>

            </div>

        </div>
    );
};

export default RevenueFilters;
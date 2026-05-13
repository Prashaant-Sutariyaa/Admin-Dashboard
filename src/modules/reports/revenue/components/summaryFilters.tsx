import {
    Download,
    Filter,
    RotateCcw,
} from "lucide-react";

import { Button } from "src/components/ui/button";

import { DateRange } from "react-day-picker";

import DateRangePicker from "src/components/ui/DateRangePicker";
import Can from "src/permissions/Can";

interface Props {
    range: DateRange | undefined;

    setRange: (
        value: DateRange | undefined
    ) => void;

    onApply: () => void;

    onReset: () => void;

    onDownload: () => void;

    downloading: boolean;

    hasFilters: boolean;

    hasData: boolean;
}

const SummaryFilters = ({
    range,
    setRange,
    onApply,
    onReset,
    onDownload,
    downloading,
    hasFilters,
    hasData,
}: Props) => {

    return (
        <div className="flex flex-wrap gap-3 items-center rounded-xl border border-border bg-lightprimary/30 dark:bg-white/5 p-4">
            <div>
                <DateRangePicker value={range} onChange={setRange} placeholder="Select date range" />
            </div>
            <Button variant="lightprimary" onClick={onApply} className="flex items-center gap-2">
                <Filter size={16} />
                Apply
            </Button>

            <Button variant="lighterror" onClick={onReset} disabled={!hasFilters} className="flex items-center gap-2">
                <RotateCcw size={16} />
                Reset
            </Button>

            <Can module="revenue" actions={['download']}>
                <Button variant="lightprimary" onClick={onDownload} disabled={downloading || !hasData} className="ml-auto flex items-center gap-2">
                    <Download size={16} />
                    {downloading ? "Downloading..." : "Download"}
                </Button>
            </Can>
        </div>
    );
};

export default SummaryFilters;
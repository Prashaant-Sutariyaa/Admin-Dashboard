import { useEffect, useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "src/components/ui/table";

import { toast } from "sonner";

import { DateRange } from "react-day-picker";

import { revenueService } from "../service/revenueService";

import { formatCurrencyNumber } from "src/utils/formatCurrencyNumber";

import { toApiDate } from "src/utils/toApiDate";

import SummaryFilters from "./summaryFilters";
import RevenueStats from "./RevenueStats";

const SummaryTable = () => {

    const [loading, setLoading] = useState(false);

    const [downloading, setDownloading] = useState(false);

    const [data, setData] = useState<any[]>([]);
const [stats, setStats] = useState<any>();
    const [range, setRange] =
        useState<DateRange | undefined>();

    // ✅ helpers
    const hasFilters =
        !!range?.from ||
        !!range?.to;

    const hasData =
        data.length > 0;

    // ✅ fetch
    const fetchSummary = async (
        customParams?: any
    ) => {

        try {

            setLoading(true);

            const params =
                customParams ?? {};

            if (!customParams) {

                if (range?.from) {
                    params.from_date =
                        toApiDate(range.from);
                }

                if (range?.to) {
                    params.to_date =
                        toApiDate(range.to);
                }
            }

            const res =
                await revenueService.getSummary(params);

                const statsRes =
    await revenueService.getRevenueStats(params);

setStats(statsRes || {});

            setData(res || []);

        } catch {

            setData([]);
setStats({});

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    // ✅ apply
    const handleApply = () => {
        fetchSummary();
    };

    // ✅ reset
    const handleReset = async () => {

        setRange(undefined);

        await fetchSummary({});
    };

    // ✅ download
    const handleDownload = async () => {

        try {

            setDownloading(true);

            const params: any = {};

            if (range?.from) {
                params.from_date =
                    toApiDate(range.from);
            }

            if (range?.to) {
                params.to_date =
                    toApiDate(range.to);
            }

            const res =
                await revenueService.downloadSummary(params);

            if (!res?.data) {

                toast.info(
                    "No data available"
                );

                return;
            }

            const blob = new Blob(
                ["\uFEFF", res.data],
                {
                    type: "text/csv;charset=utf-8;",
                }
            );

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.setAttribute(
                "download",
                "revenue-summary-table.csv"
            );

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            toast.success(
                "Summary table downloaded"
            );

        } catch (e: any) {

            toast.error(
                e?.message ||
                "Download failed"
            );

        } finally {

            setDownloading(false);
        }
    };

    return (
        <div className="space-y-5">

            {/* FILTERS */}
            <SummaryFilters
                range={range}
                setRange={setRange}
                onApply={handleApply}
                onReset={handleReset}
                onDownload={handleDownload}
                downloading={downloading}
                hasFilters={hasFilters}
                hasData={hasData}
            />
            <RevenueStats
    data={stats}
    loading={loading}
/>

            {/* TABLE */}
            <div className="rounded-xl border border-border overflow-hidden">

                <Table>

                    <TableHeader>

                        <TableRow>

                            <TableHead>
                                Month
                            </TableHead>

                            <TableHead className="text-right">
                                Booked Leads
                            </TableHead>

                            <TableHead className="text-right">
                                Accepted Leads
                            </TableHead>

                            <TableHead className="text-right">
                                Deficit Leads
                            </TableHead>

                            <TableHead className="text-right">
                                Booked Revenue
                            </TableHead>

                            <TableHead className="text-right">
                                Accepted Revenue
                            </TableHead>

                            <TableHead className="text-right">
                                Pending Revenue
                            </TableHead>

                        </TableRow>

                    </TableHeader>

                    <TableBody>

                        {loading ? (

                            <TableRow>

                                <TableCell
                                    colSpan={7}
                                    className="text-center py-10 text-muted-foreground"
                                >
                                    Loading...
                                </TableCell>

                            </TableRow>

                        ) : data.length === 0 ? (

                            <TableRow>

                                <TableCell
                                    colSpan={7}
                                    className="text-center py-10 text-muted-foreground"
                                >
                                    No data available
                                </TableCell>

                            </TableRow>

                        ) : (

                            data.map((r, index) => (

                                <TableRow
                                    key={index}
                                    className="even:bg-lightprimary/40"
                                >

                                    {/* MONTH */}
                                    <TableCell className="font-medium whitespace-nowrap min-w-40">
                                        {r.month}
                                    </TableCell>

                                    {/* BOOKED LEADS */}
                                    <TableCell className="text-right">

                                        <div className="font-semibold text-warningstrong tabular-nums">
                                            {formatCurrencyNumber(r.booked_leads)}
                                        </div>

                                    </TableCell>

                                    {/* ACCEPTED LEADS */}
                                    <TableCell className="text-right">

                                        <div className="flex items-center justify-end gap-2">

                                            <span className="font-semibold text-successemphasis tabular-nums">
                                                {formatCurrencyNumber(r.accepted_leads?.value)}
                                            </span>

                                            <span className="text-xs text-muted-foreground">
                                                ({r.accepted_leads?.percentage})
                                            </span>

                                        </div>

                                    </TableCell>

                                    {/* DEFICIT LEADS */}
                                    <TableCell className="text-right">

                                        <div className="flex items-center justify-end gap-2">

                                            <span className="font-semibold text-erroremphasis tabular-nums">
                                                {formatCurrencyNumber(r.deficit_leads?.value)}
                                            </span>

                                            <span className="text-xs text-muted-foreground">
                                                ({r.deficit_leads?.percentage})
                                            </span>

                                        </div>

                                    </TableCell>

                                    {/* BOOKED REVENUE */}
                                    <TableCell className="text-right">

                                        <div className="font-semibold text-warningstrong tabular-nums">
                                            $ {formatCurrencyNumber(r.booked_revenue)}
                                        </div>

                                    </TableCell>

                                    {/* ACCEPTED REVENUE */}
                                    <TableCell className="text-right">

                                        <div className="font-semibold text-successemphasis tabular-nums">
                                            $ {formatCurrencyNumber(r.accepted_revenue)}
                                        </div>

                                    </TableCell>

                                    {/* PENDING REVENUE */}
                                    <TableCell className="text-right">

                                        <div className="font-semibold text-erroremphasis tabular-nums">
                                            $ {formatCurrencyNumber(r.revenue_pending)}
                                        </div>

                                    </TableCell>

                                </TableRow>
                            ))
                        )}

                    </TableBody>

                </Table>

            </div>

        </div>
    );
};

export default SummaryTable;
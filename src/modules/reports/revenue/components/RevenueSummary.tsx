import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Download, Filter, RotateCcw } from "lucide-react";
import { Button } from "src/components/ui/button";
import { revenueService } from "../service/revenueService";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import DateRangePicker from "src/components/ui/DateRangePicker";
import { toApiDate } from "src/utils/toApiDate";

const getCssVar = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const RevenueSummary = () => {
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [range, setRange] = useState<DateRange | undefined>();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // 🔥 Theme (dark/light safe)
    const textColor = getCssVar("--foreground");
    const borderColor = getCssVar("--border");

    // 🔥 Helpers
    const hasFilters = !!startDate || !!endDate;
    const hasData = data.length > 0;

    // 🔥 Fetch
    const fetchSummary = async (customParams?: any) => {

        try {
            setLoading(true);

            const params = customParams ?? {};

            if (!customParams) {

                if (range?.from) {
                    params.from_date = toApiDate(range.from);
                }

                if (range?.to) {
                    params.to_date = toApiDate(range.to);
                }
            }

            const res = await revenueService.getSummary(params);

            setData(res || []);

        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    // 🔥 Apply
    const handleApply = () => {

        if (
            range?.from &&
            range?.to &&
            range.from > range.to
        ) {
            toast.error(
                "Start date cannot be after end date"
            );

            return;
        }

        fetchSummary();
    };

    // 🔥 Reset (clean)
    const handleReset = async () => {

        setRange(undefined);

        await fetchSummary({});
    };

    // 🔥 Download
    const handleDownload = async () => {

        try {
            setDownloading(true);

            const params: any = {};

            if (range?.from) {
                params.from_date = toApiDate(range.from);
            }

            if (range?.to) {
                params.to_date = toApiDate(range.to);
            }

            const res =
                await revenueService.downloadSummary(params);

            if (!res?.data) {
                toast.info("No data available");

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
                "revenue-summary.csv"
            );

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            toast.success("Summary downloaded");

        } catch (e: any) {

            toast.error(
                e?.message || "Download failed"
            );

        } finally {

            setDownloading(false);
        }
    };

    const formatMonth = (value: string) => {

        const [month, year] = value.split("-");

        return `${month.slice(0, 3)} ${year.slice(2)}`;
    };
    // 🔥 Data
    const months = data.map((d) => formatMonth(d.month));

    const leadsSeries = [
        { name: "Booked", data: data.map((d) => d.booked_leads) },
        { name: "Accepted", data: data.map((d) => d.accepted_leads.value) },
        { name: "Deficit", data: data.map((d) => d.deficit_leads.value) },
    ];

    const revenueSeries = [
        { name: "Booked", data: data.map((d) => d.booked_revenue) },
        { name: "Accepted", data: data.map((d) => d.accepted_revenue) },
        { name: "Pending", data: data.map((d) => d.revenue_pending) },
    ];

    // 🔥 Shared chart config (DARK MODE FIX)
    const baseOptions: ApexOptions = {
        chart: {
            toolbar: { show: false },
            zoom: { enabled: false },
            foreColor: textColor, // 🔥 important
            background: "transparent",
        },
        xaxis: {
            categories: months,
            labels: {
                style: {
                    colors: months.map(() => textColor), // 🔥 FIX
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: [textColor], // 🔥 FIX
                },
            },
        },
        grid: {
            borderColor: borderColor,
            strokeDashArray: 3,
        },
        tooltip: {
            theme: document.documentElement.classList.contains("dark")
                ? "dark"
                : "light",
        },
        dataLabels: { enabled: false },
        legend: {
            labels: {
                colors: textColor,
            },
        },
    };

    const leadsOptions: ApexOptions = {
        ...baseOptions,

        colors: [
            "#FEB019", // 🔥 Apex yellow (Booked)
            "#00E396", // 🔥 Apex green (Accepted)
            "#FF4560", // 🔥 Apex red (Deficit)
        ],

        chart: {
            ...baseOptions.chart,
            type: "bar" as const,
        },

        plotOptions: {
            bar: {
                columnWidth: "30%",
                borderRadius: 3,
            },
        },
    };
    const revenueOptions: ApexOptions = {
        ...baseOptions,

        colors: [
            "#FEB019", // 🔥 Allocation / Booked
            "#00E396", // 🔥 Accepted
            "#FF4560", // 🔥 Pending / Deficit
        ],

        chart: {
            ...baseOptions.chart,
            type: "area" as const,
        },

        stroke: {
            curve: "smooth",
            width: 2,
        },

        yaxis: {
            labels: {
                formatter: (v: number) => `${v.toLocaleString()}`,
            },
        },
    };

    return (
        <div className="space-y-5">

            {/* FILTERS */}
            <div className="flex flex-wrap gap-3 items-center rounded-xl border border-border bg-lightprimary/30 dark:bg-white/5 p-4">

                <div className="w-[320px]">

                    <DateRangePicker
                        value={range}
                        onChange={setRange}
                        placeholder="Select date range"
                    />

                </div>

                <Button
                    variant="lightprimary"
                    onClick={handleApply}
                    className="flex items-center gap-2"
                >
                    <Filter size={16} />
                    Apply
                </Button>

                <Button
                    variant="lighterror"
                    onClick={handleReset}
                    disabled={!hasFilters}
                    className="flex items-center gap-2"
                >
                    <RotateCcw size={16} />
                    Reset
                </Button>

                <Button
                    variant="lightprimary"
                    onClick={handleDownload}
                    disabled={downloading || !hasData}
                    className="ml-auto flex items-center gap-2"
                >
                    <Download size={16} />
                    {downloading ? "Downloading..." : "Download"}
                </Button>

            </div>

            {/* CONTENT */}
            {loading ? (
                <div className="text-center py-20 text-muted-foreground">
                    Loading...
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border rounded-xl">
                    No data available
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                    {/* LEADS */}
                    <div className="rounded-xl border border-border bg-background p-5">
                        <p className="text-sm font-semibold mb-4">
                            Leads Summary
                        </p>

                        <Chart
                            options={leadsOptions}
                            series={leadsSeries}
                            type="bar"
                            height={300}
                        />
                    </div>

                    {/* REVENUE */}
                    <div className="rounded-xl border border-border bg-background p-5">
                        <p className="text-sm font-semibold mb-4">
                            Revenue Summary
                        </p>

                        <Chart
                            options={revenueOptions}
                            series={revenueSeries}
                            type="area"
                            height={300}
                        />
                    </div>

                </div>
            )}

        </div>
    );
};

export default RevenueSummary;
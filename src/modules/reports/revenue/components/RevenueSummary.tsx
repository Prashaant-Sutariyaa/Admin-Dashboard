import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { revenueService } from "../service/revenueService";
import { toApiDate } from "src/utils/toApiDate";
import SummaryFilters from "./summaryFilters";
import RevenueStats from "./RevenueStats";

const getCssVar = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const getThemeColors = () => ({
    textColor: getCssVar("--foreground"),
    borderColor: getCssVar("--border"),
    isDark: document.documentElement.classList.contains("dark"),
});

const RevenueSummary = () => {
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [stats, setStats] = useState<any>();
    const [range, setRange] = useState<DateRange | undefined>();

    // ✅ reactive theme state
    const [theme, setTheme] = useState(getThemeColors);

    // ✅ watch for dark/light class changes on <html>
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(getThemeColors());
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, []);

    const { textColor, borderColor, isDark } = theme;

    const hasFilters = !!range?.from || !!range?.to;
    const hasData = data.length > 0;

    const fetchSummary = async (customParams?: any) => {
        try {
            setLoading(true);
            const params = customParams ?? {};
            if (!customParams) {
                if (range?.from) params.from_date = toApiDate(range.from);
                if (range?.to) params.to_date = toApiDate(range.to);
            }
            const res = await revenueService.getSummary(params);
            const statsRes = await revenueService.getRevenueStats(params);
            setData(res || []);
            setStats(statsRes || {});
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

    const handleApply = () => fetchSummary();

    const handleReset = async () => {
        setRange(undefined);
        await fetchSummary({});
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const params: any = {};
            if (range?.from) params.from_date = toApiDate(range.from);
            if (range?.to) params.to_date = toApiDate(range.to);
            const res = await revenueService.downloadSummary(params);
            if (!res?.data) { toast.info("No data available"); return; }
            const blob = new Blob(["\uFEFF", res.data], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "revenue-summary.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Summary downloaded");
        } catch (e: any) {
            toast.error(e?.message || "Download failed");
        } finally {
            setDownloading(false);
        }
    };

    const formatMonth = (value: string) => {
        const [month, year] = value.split("-");
        return `${month.slice(0, 3)} ${year.slice(2)}`;
    };

    const months = data.map((d) => formatMonth(d.month));

    const leadsSeries = [
        { name: "Booked",   data: data.map((d) => d.booked_leads) },
        { name: "Accepted", data: data.map((d) => d.accepted_leads.value) },
        { name: "Deficit",  data: data.map((d) => d.deficit_leads.value) },
    ];

    const revenueSeries = [
        { name: "Booked",  data: data.map((d) => d.booked_revenue) },
        { name: "Accepted",data: data.map((d) => d.accepted_revenue) },
        { name: "Pending", data: data.map((d) => d.revenue_pending) },
    ];

    // ✅ base options now uses reactive theme values
    const baseOptions: ApexOptions = {
        chart: {
            toolbar: { show: false },
            zoom: { enabled: false },
            foreColor: textColor,
            background: "transparent",
        },
        xaxis: {
            categories: months,
            labels: {
                style: { colors: months.map(() => textColor) },
            },
        },
        yaxis: {
            labels: {
                style: { colors: [textColor] },
            },
        },
        grid: {
            borderColor: borderColor,
            strokeDashArray: 3,
        },
        tooltip: {
            theme: isDark ? "dark" : "light", // ✅ now reactive
        },
        dataLabels: { enabled: false },
        legend: {
            labels: { colors: textColor },
        },
    };

    const leadsOptions: ApexOptions = {
        ...baseOptions,
        chart: { ...baseOptions.chart, type: "bar" },
        plotOptions: {
            bar: { columnWidth: "30%", borderRadius: 3 },
        },
    };

    const revenueOptions: ApexOptions = {
        ...baseOptions,
        chart: { ...baseOptions.chart, type: "area" },
        stroke: { curve: "smooth", width: 2 },
        yaxis: {
            labels: {
                formatter: (v: number) => `${v.toLocaleString()}`,
            },
        },
    };

    return (
        <div className="space-y-5">
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
            <RevenueStats data={stats} loading={loading} />

            {loading ? (
                <div className="text-center py-20 text-muted-foreground">Loading...</div>
            ) : data.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border rounded-xl">
                    No data available
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    <div className="rounded-xl border border-border bg-background p-5">
                        <p className="text-sm font-semibold mb-4">Leads Summary</p>
                        <Chart key={isDark ? 'dark' : 'light'} options={leadsOptions} series={leadsSeries} type="bar" height={300} />
                    </div>
                    <div className="rounded-xl border border-border bg-background p-5">
                        <p className="text-sm font-semibold mb-4">Revenue Summary</p>
                        <Chart key={isDark ? 'dark' : 'light'} options={revenueOptions} series={revenueSeries} type="area" height={300} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default RevenueSummary;
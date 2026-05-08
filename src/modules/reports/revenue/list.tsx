import { useEffect, useState } from "react";

import SlimBreadcrumb from "src/components/shared/breadcrumb/SlimBreadcrumb";
import CardBox from "src/components/shared/CardBox";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "src/components/ui/tabs";

import RevenueFilters from "./components/filters";
import RevenueTable from "./components/table";
import RevenueSummary from "./components/RevenueSummary";

import SharedPagination from "src/components/shared/pagination/SharedPagination";

import { revenueService } from "./service/revenueService";

import {
    Table2,
    BarChart3,
    LayoutDashboard,
} from "lucide-react";

import { clientService } from "src/modules/clients/services/clientService";
import SummaryTable from "./components/SummaryTable";
import RevenueStats from "./components/RevenueStats";

const RevenueList = () => {

    const [data, setData] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [stats, setStats] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // ✅ pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    // ✅ filters
    const [filters, setFilters] = useState<any>({});

    const BCrumb = [
        { to: "/", title: "Home" },
        { title: "Reports" },
        { title: "Revenue" },
    ];

    // ✅ fetch revenue
    const fetchRevenue = async () => {
        try {
            setLoading(true);

            const res = await revenueService.getRevenue({
                ...filters,
                page,
                limit,
            });
            const statsRes =
                await revenueService.getRevenueStats(filters);

            setStats(statsRes || {});

            setData(res.data || []);
            setTotal(res.total || 0);

        } catch {
            setData([]);
            setTotal(0);
            setStats({});
        } finally {
            setLoading(false);
        }
    };

    // ✅ load clients
    const fetchClients = async () => {
        try {
            const res = await clientService.getAllClients();

            setClients(
                res.map((c: any) => ({
                    label: `${c.code} - ${c.name}`,
                    value: String(c.id),
                }))
            );

        } catch {
            setClients([]);
        }
    };

    // ✅ load
    useEffect(() => {
        fetchRevenue();
    }, [page, limit, filters]);

    useEffect(() => {
        fetchClients();
    }, []);

    // ✅ apply filters
    const handleApply = (newFilters: any) => {
        setFilters(newFilters);
        setPage(1);
    };

    // ✅ download
    const handleDownload = async (downloadFilters: any) => {
        try {
            setDownloading(true);

            const res = await revenueService.downloadRevenue(downloadFilters);

            const blob = new Blob(["\uFEFF", res.data], {
                type: "text/csv;charset=utf-8;",
            });

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;

            link.setAttribute("download", "revenue-report.csv");

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            <SlimBreadcrumb title="Revenue" items={BCrumb} />

            <Tabs defaultValue="summary" className="space-y-4">

                {/* TOP */}
                <div className="flex items-center justify-between">

                    <TabsList className="h-11 rounded-lg border border-border bg-background p-1">

                        <TabsTrigger value="summary" className="gap-2 px-4">
                            <BarChart3 size={16} />
                            Summary
                        </TabsTrigger>
                        <TabsTrigger value="monthly" className="gap-2 px-4" >
                            <LayoutDashboard size={16} />
                            Monthly
                        </TabsTrigger>
                        <TabsTrigger value="details" className="gap-2 px-4">
                            <Table2 size={16} />
                            Details
                        </TabsTrigger>
                    </TabsList>

                </div>

                {/* SUMMARY */}
                <TabsContent value="summary">
                    <CardBox>
                        <RevenueSummary />
                    </CardBox>
                </TabsContent>

                {/* SUMMARY TABLE */}
                <TabsContent value="monthly">
                    <CardBox>
                        <SummaryTable />
                    </CardBox>
                </TabsContent>

                {/* DETAILS */}
                <TabsContent value="details">
                    <CardBox className="space-y-4">
                        <RevenueFilters
                            clients={clients}
                            onApply={handleApply}
                            onDownload={handleDownload}
                            downloading={downloading}
                            hasData={data.length > 0}
                        />
                        <RevenueStats
                            data={stats}
                            loading={loading}
                        />
                        <RevenueTable data={data} loading={loading} />
                        <SharedPagination
                            page={page}
                            limit={limit}
                            total={total}
                            onPageChange={setPage}
                            onLimitChange={(l) => {
                                setLimit(l);
                                setPage(1);
                            }}
                        />
                    </CardBox>
                </TabsContent>

            </Tabs>
        </>
    );
};

export default RevenueList;
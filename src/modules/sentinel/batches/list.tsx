import { useEffect, useState } from "react";

import SlimBreadcrumb from "src/components/shared/breadcrumb/SlimBreadcrumb";
import CardBox from "src/components/shared/CardBox";

import SharedPagination from "src/components/shared/pagination/SharedPagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "src/components/ui/dialog";

import SentinelBatchesTable from "./components/table";
import SentinelBatchSearch from "./components/searchFilter";

import {
    SentinelBatch,
    SentinelBatchesService,
} from "./services/SentinelBatchesService";
import { Button } from "src/components/ui/button";
import { Upload } from "lucide-react";
import SentinelBatchUploadDialog from "./components/dialog";

const SentinelBatches = () => {
    const [loading, setLoading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [batches, setBatches] = useState<SentinelBatch[]>([]);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    // ✅ search states
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // ✅ debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);

            // reset page on search
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const loadData = async () => {
        try {

            setLoading(true);

            const batchRes =
                await SentinelBatchesService.getBatches(
                    page,
                    limit,
                    debouncedSearch
                );

            setBatches(batchRes.data || []);

            setTotal(batchRes.total || 0);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [page, limit, debouncedSearch]);

    const BCrumb = [
        { to: "/", title: "Home" },
        { title: "sentinel-Batches" },
    ];

    return (
        <>
            <SlimBreadcrumb
                title="Sentinel Batches"
                items={BCrumb}
            />

            <CardBox className="overflow-hidden">

                {/* Search */}
                {/* Top Actions */}
                <div className="p-4 flex items-center justify-between gap-4">

                    <SentinelBatchSearch
                        value={search}
                        onChange={setSearch}
                    />

                    <Button variant="lightprimary" onClick={() => setUploadDialogOpen(true)}>
                        <Upload className="size-4" />
                        Upload
                    </Button>

                </div>

                {/* Table */}
                <SentinelBatchesTable data={batches} loading={loading} />

                {/* Pagination */}
                <SharedPagination
                    page={page}
                    limit={limit}
                    total={total}
                    onPageChange={setPage}
                    onLimitChange={(value) => {
                        setLimit(value);
                        setPage(1);
                    }}
                />

            </CardBox>
            <SentinelBatchUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
        </>
    );
};

export default SentinelBatches;
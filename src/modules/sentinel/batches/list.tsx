import { useEffect, useState } from "react";

import SlimBreadcrumb from "src/components/shared/breadcrumb/SlimBreadcrumb";
import CardBox from "src/components/shared/CardBox";

import SharedPagination from "src/components/shared/pagination/SharedPagination";

import SentinelBatchesTable from "./components/table";
import SentinelBatchSearch from "./components/searchFilter";

import {
    SentinelBatch,
    SentinelBatchesService,
} from "./services/SentinelBatchesService";
import { Button } from "src/components/ui/button";
import { Upload } from "lucide-react";
import SentinelBatchUploadDialog from "./components/dialog";
import { useSearchParams } from "react-router";
import { userService } from "src/modules/users/services/userService";
import { departmentService } from "src/modules/admin/departments/services/departmentService";

const SentinelBatches = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [batches, setBatches] = useState<SentinelBatch[]>([]);
    const [currentDepartment, setCurrentDepartment] = useState("");

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    // ✅ search states
    const [search, setSearch] = useState(searchParams.get("search")?.trim() || "");
    const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search")?.trim() || "");

    // ✅ debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            // reset page on search
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const loadCurrentDepartment = async () => {
        try {
            const profile = await userService.getProfile();
            const departments = await departmentService.getActiveDepartmentsList();
            const matchedDepartment = departments.find(
                (d) => d.id === profile.department_id
            );
            setCurrentDepartment(matchedDepartment?.name || "");
        } catch (error) {
            console.error("Failed to load current department", error);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const batchRes = await SentinelBatchesService.getBatches(page, limit, debouncedSearch);
            setBatches(batchRes.data || []);
            setTotal(batchRes.total || 0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setSearch(searchParams.get("search")?.trim() || "");
    }, [searchParams]);

    useEffect(() => {
        loadCurrentDepartment();
    }, []);

    useEffect(() => {
        loadData();
    }, [page, limit, debouncedSearch]);

    const BCrumb = [
        { to: "/", title: "Home" },
        { title: "sentinel-Segments" },
    ];

    return (
        <>
            <SlimBreadcrumb title="Sentinel Segments" items={BCrumb} />
            <CardBox className="overflow-hidden">

                {/* Search */}
                <div className="p-4 flex items-center justify-between gap-4">
                    <SentinelBatchSearch value={search}onChange={setSearch}/>
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
            <SentinelBatchUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} currentDepartment={currentDepartment} />
        </>
    );
};

export default SentinelBatches;
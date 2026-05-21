import { useEffect, useState } from "react";

import { useParams } from "react-router";

import SlimBreadcrumb from "src/components/shared/breadcrumb/SlimBreadcrumb";

import CardBox from "src/components/shared/CardBox";

import companyImg from 'src/assets/images/dashboard/office.png';
import SharedPagination from "src/components/shared/pagination/SharedPagination";

import {
    SentinelBatch,
    SentinelBatchesService,
} from "./services/SentinelBatchesService";

import SentinelBatchDetailsTable from "./components/detailsTable";

const SentinelDetailBatch = () => {
    const { segmentCode } = useParams();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SentinelBatch[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [total, setTotal] = useState(0);
    const firstRow = data?.[0];
    const loadData = async () => {
        try {
            if (!segmentCode) return;
            setLoading(true);
            const res = await SentinelBatchesService.getBatchDetails(segmentCode, page, limit);
            setData(res.data || []);
            setTotal(res.total || 0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [segmentCode, page, limit]);

    const BCrumb = [
        { to: "/", title: "Home" },
        { to: "/sentinel-segments", title: "Sentinel Batches" },
        { title: "Details" },
    ];

    return (
        <>

            <SlimBreadcrumb title="Sentinel Batch Details" items={BCrumb} />

            <div className="space-y-6">
                <CardBox className="p-6 overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
                        <div>
                            <img src={companyImg} alt="segment" width={80} height={80} className="rounded-lg" />

                        </div>

                        {/* CONTENT */}
                        <div className="flex justify-between items-center w-full flex-wrap gap-4">
                            {/* LEFT */}
                            <div className="flex flex-col gap-1.5 text-center sm:text-left">
                                <h5 className="card-title">
                                    Sentinel Segment Details
                                </h5>
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm text-muted-foreground">
                                        {firstRow?.title || "-"}
                                    </p>
                                    <div className="hidden h-4 w-px bg-border xl:block"></div>
                                    <p className="text-sm text-primary">
                                        {firstRow?.campaign_code || "-"}
                                    </p>
                                    <div className="hidden h-4 w-px bg-border xl:block"></div>
                                    <p className="text-sm font-medium text-primary">
                                        {segmentCode}
                                    </p>
                                    <div className="hidden h-4 w-px bg-border xl:block"></div>

                                </div>

                            </div>

                        </div>

                    </div>

                </CardBox>

                {/* TABLE */}
                <SentinelBatchDetailsTable data={data} loading={loading} />

                {/* PAGINATION */}
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

            </div>

        </>
    );
};

export default SentinelDetailBatch;
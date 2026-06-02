import { useEffect, useState } from "react";

import SlimBreadcrumb from "src/components/shared/breadcrumb/SlimBreadcrumb";

import SentinelJobsTable from "./components/SentinelJobsTable";

import SharedPagination from "src/components/shared/pagination/SharedPagination";

import {
    SentinelJobService
} from "./services/SentinelJobService";
import CardBox from "src/components/shared/CardBox";

const SentinelJobs = () => {

    const BCrumb = [
        { to: '/', title: 'Sentinel' },
        { title: 'Jobs' },
    ];

    const [jobs, setJobs] =
        useState<any[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [page, setPage] =
        useState(1);

    const [limit, setLimit] =
        useState(20);

    const [total, setTotal] =
        useState(0);

    const [search, setSearch] =
        useState("");

    const [debouncedSearch, setDebouncedSearch] =
        useState("");

    // ✅ debounce
    useEffect(() => {

        const timer =
            setTimeout(() => {

                setDebouncedSearch(
                    search
                );

                setPage(1);

            }, 500);

        return () =>
            clearTimeout(timer);

    }, [search]);

    const loadJobs = async () => {

        try {

            setLoading(true);

            const res =
                await SentinelJobService.getJobs(
                    page,
                    limit,
                    debouncedSearch
                );

            setJobs(
                res.data || []
            );

            setTotal(
                res.total || 0
            );

        } catch {

            setJobs([]);

            setTotal(0);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, [
        page,
        limit,
        debouncedSearch,
    ]);

    return (
        <>
            <SlimBreadcrumb
                title="Sentinel Jobs"
                items={BCrumb}
            />

            <CardBox className="overflow-hidden">

                <SentinelJobsTable
                    jobs={jobs}
                    loading={loading}
                    search={search}
                    setSearch={setSearch}
                />

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
        </>
    );
};

export default SentinelJobs;
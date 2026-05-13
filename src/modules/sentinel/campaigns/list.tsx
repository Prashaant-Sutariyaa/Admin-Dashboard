import { useEffect, useState } from "react";
import SlimBreadcrumb from "src/components/shared/breadcrumb/SlimBreadcrumb";
import CardBox from "src/components/shared/CardBox";
import SharedPagination from "src/components/shared/pagination/SharedPagination";
import SentinelBatchesTable from "./components/table";
import SentinelCampaignSearch from "./components/SentinelCampaignSearch";
import { SentinelBatch, SentinelCampaignService } from "./services/SentinelCampaignService";

const SentinelCampaigns = () => {
  const [loading, setLoading] = useState(false);
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
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const batchRes = await SentinelCampaignService.getSentinelCampaigns(page, limit, debouncedSearch);
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
    { title: "sentinel-Campaigns" },
  ];

  return (
    <>
      <SlimBreadcrumb title="Sentinel Campaigns" items={BCrumb} />
      <CardBox className="overflow-hidden">

        <div className="p-4 flex items-center justify-between gap-4">
          <SentinelCampaignSearch value={search} onChange={setSearch} />
        </div>

        <SentinelBatchesTable data={batches} loading={loading} />

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

export default SentinelCampaigns
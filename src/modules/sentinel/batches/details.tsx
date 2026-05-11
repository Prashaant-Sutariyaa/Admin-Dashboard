import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';

const SentinelDetailBatch = () => {
    const BCrumb = [
        { to: "/", title: "Home" },
        { to: "/sentinel-batches", title: "Sentinel Batches" },
        { title: "Batch Details" },
    ];

    return (
        <>
            <SlimBreadcrumb title="Sentinel Batches" items={BCrumb} />
            <div>SentinelDetailBatch</div>
        </>
    )
}

export default SentinelDetailBatch
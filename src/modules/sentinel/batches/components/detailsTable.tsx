import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/ui/table";
import { SentinelBatch, SentinelBatchesService } from "../services/SentinelBatchesService";
import { Download } from "lucide-react";
interface Props {
    data: SentinelBatch[];
    loading: boolean;
}

const SEGMENT_WIDTH = 110;

const GROUP = {
    dataops: { headerBg: "bg-lightprimary", bodyBg: "bg-lightprimary/30", text: "text-primary", border: "border-primary/30" },
    email: { headerBg: "bg-lightinfo", bodyBg: "bg-lightinfo/30", text: "text-info", border: "border-info/30" },
    quality: { headerBg: "bg-lightsuccess", bodyBg: "bg-lightsuccess/30", text: "text-success", border: "border-success/30" },
    dbr: { headerBg: "bg-lightprimary", bodyBg: "bg-lightprimary/30", text: "text-primary", border: "border-primary/30" },
    vv: { headerBg: "bg-lightsecondary", bodyBg: "bg-lightsecondary/30", text: "text-secondary", border: "border-secondary/30" },
    mis: { headerBg: "bg-lightinfo", bodyBg: "bg-lightinfo/30", text: "text-info", border: "border-info/30" },
};

const GroupHead = ({ label, colSpan, group }: { label: string; colSpan: number; group: keyof typeof GROUP }) => (
    <TableHead colSpan={colSpan} className={`text-center font-semibold text-xs tracking-wide border-l-2 border-r border-b-2 ${GROUP[group].headerBg} ${GROUP[group].border}`}>
        {label}
    </TableHead>
);

const SubHead = ({ label, isFirst = false, group }: { label: string; isFirst?: boolean; group: keyof typeof GROUP }) => (
    <TableHead className={`text-center text-xs whitespace-nowrap border-b-2 border-r ${GROUP[group].headerBg} ${GROUP[group].border} ${isFirst ? `border-l-2 ${GROUP[group].border}` : ""}`}>
        {label}
    </TableHead>
);

// ✅ Sticky cell styles as inline — Tailwind z-* gets overridden by stacking context
const stickySegment: React.CSSProperties = {
    position: "sticky",
    left: 0,
    width: `${SEGMENT_WIDTH}px`,
    minWidth: `${SEGMENT_WIDTH}px`,
    zIndex: 20,          // ✅ inline z — wins over everything
};

// Lower z for body rows so header rows always win
const stickySegmentBody: React.CSSProperties = { ...stickySegment, zIndex: 20 };

const SentinelBatchDetailsTable = ({ data, loading }: Props) => {

    const downloadFile = async (batchCode: string, metric: string, department: string) => {
        try {
            const blob = await SentinelBatchesService.exportBatchData(batchCode, metric, department);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${batchCode}_${department}_${metric}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
             console.error("Download failed:", error);
        }
    };
    const GCell = ({ children, isFirst = false, group, className = "", metric, department, batchCode }: {
        children: React.ReactNode;
        isFirst?: boolean;
        group: keyof typeof GROUP;
        className?: string;
        metric: string;
        department: string;
        batchCode: string;
    }) => {
        const hasValue = Number(children) > 0;
        return (
            <TableCell className={` text-center border-b border-r p-0 ${GROUP[group].bodyBg} ${GROUP[group].border} ${isFirst ? `border-l-2 ${GROUP[group].border}` : ""} ${className}`}>
                {hasValue ? (
                    <button type="button" onClick={() => downloadFile(batchCode, metric, department)} className="w-full min-h-10 flex items-center justify-center group/btn" >
                        <span className={`text-sm font-medium tabular-nums transition-all duration-200 ease-out group-hover/btn:opacity-0 group-hover/btn:scale-75 `}>
                            {children}
                        </span>
                        <Download size={14} strokeWidth={1.75} className={` absolute opacity-0 scale-75 transition-all duration-200 ease-out group-hover/btn:opacity-100 group-hover/btn:scale-100 ${GROUP[group].text}`} />
                    </button>
                ) : (
                    <span className="flex items-center font-medium justify-center min-h-10 text-sm">
                        {children}
                    </span>
                )}
            </TableCell>
        );
    };
    return (

        <div className=" border border-border rounded-md overflow-hidden">
            {loading ? (
                <div className="h-96 flex items-center justify-center text-muted-foreground text-lg font-bold">
                    Loading Sentinel Segments...
                </div>
            ) : data.length === 0 ? (
                <div className="h-96 flex items-center justify-center text-muted-foreground text-lg font-bold">
                    No Sentinel Segments found.
                </div>
            ) : (
                <div className="overflow-x-auto" style={{ position: "relative" }}>
                    <Table style={{ minWidth: "2600px", borderCollapse: "separate", borderSpacing: 0 }}>
                        <TableHeader>
                            <TableRow>
                                <TableHead rowSpan={2} className="text-center font-semibold border-b-2 border-r-2 border-border bg-muted" style={stickySegment}>
                                    Batch Code
                                </TableHead>
                                <GroupHead label="DataOps" colSpan={3} group="dataops" />
                                <GroupHead label="Email" colSpan={4} group="email" />
                                <GroupHead label="Quality" colSpan={4} group="quality" />
                                <GroupHead label="DB Refresh" colSpan={4} group="dbr" />
                                <GroupHead label="VV" colSpan={4} group="vv" />
                                <GroupHead label="MIS" colSpan={7} group="mis" />
                            </TableRow>
                            <TableRow style={{ position: "relative", zIndex: 1 }}>
                                <SubHead label="Total" isFirst group="dataops" />
                                <SubHead label="Valid" group="dataops" />
                                <SubHead label="Invalid" group="dataops" />

                                <SubHead label="Total" isFirst group="email" />
                                <SubHead label="Pending" group="email" />
                                <SubHead label="Valid" group="email" />
                                <SubHead label="Invalid" group="email" />

                                <SubHead label="Total" isFirst group="quality" />
                                <SubHead label="Pending" group="quality" />
                                <SubHead label="Valid" group="quality" />
                                <SubHead label="Invalid" group="quality" />

                                <SubHead label="Total" isFirst group="dbr" />
                                <SubHead label="Pending" group="dbr" />
                                <SubHead label="Valid" group="dbr" />
                                <SubHead label="Invalid" group="dbr" />

                                <SubHead label="Total" isFirst group="vv" />
                                <SubHead label="Pending" group="vv" />
                                <SubHead label="Valid" group="vv" />
                                <SubHead label="Invalid" group="vv" />

                                <SubHead label="Total" isFirst group="mis" />
                                <SubHead label="Pending" group="mis" />
                                <SubHead label="Delivered" group="mis" />
                                <SubHead label="Accepted" group="mis" />
                                <SubHead label="Client Rejected" group="mis" />
                                <SubHead label="RTD" group="mis" />
                                <SubHead label="Internal Rejected" group="mis" />
                            </TableRow>

                        </TableHeader>

                        <TableBody>
                            {data.map((batch) => (
                                <TableRow key={batch.segment_code} className="odd:bg-transparent text-left even:bg-muted/50 hover:bg-muted/50">
                                    <TableCell className="border-b border-r-2 border-border bg-background " style={stickySegmentBody}>
                                        <span className="font-medium cursor-pointer text-primary">
                                            {batch.batch_code}
                                        </span>
                                    </TableCell>
                                    <GCell isFirst group="dataops" metric="total" department="DataOps" batchCode={batch.batch_code} >
                                        {batch.dataops_total}
                                    </GCell>
                                    <GCell group="dataops" metric="valid" department="DataOps" batchCode={batch.batch_code} >
                                        {batch.dataops_valid}
                                    </GCell>
                                    <GCell group="dataops" metric="invalid" department="DataOps" batchCode={batch.batch_code} >
                                        {batch.dataops_invalid}
                                    </GCell>

                                    <GCell isFirst group="email" metric="total" department="Email" batchCode={batch.batch_code} >
                                        {batch.email_total}
                                    </GCell>

                                    <GCell group="email" metric="pending" department="Email" batchCode={batch.batch_code} >
                                        {batch.email_pending}
                                    </GCell>

                                    <GCell group="email" metric="valid" department="Email" batchCode={batch.batch_code} >
                                        {batch.email_valid}
                                    </GCell>

                                    <GCell group="email" metric="invalid" department="Email" batchCode={batch.batch_code} >
                                        {batch.email_invalid}
                                    </GCell>

                                    <GCell isFirst group="quality" metric="total" department="Quality" batchCode={batch.batch_code} >
                                        {batch.quality_total}
                                    </GCell>

                                    <GCell group="quality" metric="pending" department="Quality" batchCode={batch.batch_code} >
                                        {batch.quality_pending}
                                    </GCell>

                                    <GCell group="quality" metric="valid" department="Quality" batchCode={batch.batch_code} >
                                        {batch.quality_valid}
                                    </GCell>

                                    <GCell group="quality" metric="invalid" department="Quality" batchCode={batch.batch_code} >
                                        {batch.quality_invalid}
                                    </GCell>

                                    <GCell isFirst group="dbr" metric="total" department="DB Refresh" batchCode={batch.batch_code} >
                                        {batch.dbr_total}
                                    </GCell>

                                    <GCell group="dbr" metric="pending" department="DB Refresh" batchCode={batch.batch_code} >
                                        {batch.dbr_pending}
                                    </GCell>

                                    <GCell group="dbr" metric="valid" department="DB Refresh" batchCode={batch.batch_code} >
                                        {batch.dbr_valid}
                                    </GCell>

                                    <GCell group="dbr" metric="invalid" department="DB Refresh" batchCode={batch.batch_code} >
                                        {batch.dbr_invalid}
                                    </GCell>

                                    <GCell isFirst group="vv" metric="total" department="VV" batchCode={batch.batch_code} >
                                        {batch.vv_total}
                                    </GCell>

                                    <GCell group="vv" metric="pending" department="VV" batchCode={batch.batch_code} >
                                        {batch.vv_pending}
                                    </GCell>

                                    <GCell group="vv" metric="valid" department="VV" batchCode={batch.batch_code} >
                                        {batch.vv_valid}
                                    </GCell>

                                    <GCell group="vv" metric="invalid" department="VV" batchCode={batch.batch_code} >
                                        {batch.vv_invalid}
                                    </GCell>

                                    <GCell isFirst group="mis" metric="total" department="MIS" batchCode={batch.batch_code} >
                                        {batch.mis_total}
                                    </GCell>

                                    <GCell group="mis" metric="pending" department="MIS" batchCode={batch.batch_code} >
                                        {batch.mis_pending}
                                    </GCell>

                                    <GCell group="mis" metric="delivered" department="MIS" batchCode={batch.batch_code} >
                                        {batch.mis_delivered}
                                    </GCell>

                                    <GCell group="mis" metric="accepted" department="MIS" batchCode={batch.batch_code} >
                                        {batch.mis_accepted}
                                    </GCell>

                                    <GCell group="mis" metric="client_rejected" department="MIS" batchCode={batch.batch_code} >
                                        {batch.mis_client_rejected}
                                    </GCell>

                                    <GCell group="mis" metric="rtd" department="MIS" batchCode={batch.batch_code} >
                                        {batch.mis_rtd}
                                    </GCell>

                                    <GCell group="mis" metric="internal_rejected" department="MIS" batchCode={batch.batch_code} >
                                        {batch.mis_internal_rejected}
                                    </GCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </div>

            )}

        </div>
    );
};

export default SentinelBatchDetailsTable;
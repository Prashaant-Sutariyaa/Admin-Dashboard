import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/ui/table";
import { SentinelBatch } from "../services/SentinelBatchesService";
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

const GCell = ({ children, isFirst = false, group, className = "" }: { children: React.ReactNode; isFirst?: boolean; group: keyof typeof GROUP; className?: string }) => (
    <TableCell className={`text-center border-b border-r ${GROUP[group].bodyBg} ${GROUP[group].border} ${isFirst ? `border-l-2 ${GROUP[group].border}` : ""} ${className}`}>
        {children}
    </TableCell>
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
                                    <GCell isFirst group="dataops">{batch.dataops_total}</GCell>
                                    <GCell group="dataops">{batch.dataops_valid}</GCell>
                                    <GCell group="dataops">{batch.dataops_invalid}</GCell>

                                    <GCell isFirst group="email">{batch.email_total}</GCell>
                                    <GCell group="email">{batch.email_pending}</GCell>
                                    <GCell group="email">{batch.email_valid}</GCell>
                                    <GCell group="email">{batch.email_invalid}</GCell>

                                    <GCell isFirst group="quality">{batch.quality_total}</GCell>
                                    <GCell group="quality">{batch.quality_pending}</GCell>
                                    <GCell group="quality">{batch.quality_valid}</GCell>
                                    <GCell group="quality">{batch.quality_invalid}</GCell>

                                    <GCell isFirst group="dbr">{batch.dbr_total}</GCell>
                                    <GCell group="dbr">{batch.dbr_pending}</GCell>
                                    <GCell group="dbr">{batch.dbr_valid}</GCell>
                                    <GCell group="dbr">{batch.dbr_invalid}</GCell>

                                    <GCell isFirst group="vv">{batch.vv_total}</GCell>
                                    <GCell group="vv">{batch.vv_pending}</GCell>
                                    <GCell group="vv">{batch.vv_valid}</GCell>
                                    <GCell group="vv">{batch.vv_invalid}</GCell>

                                    <GCell isFirst group="mis">{batch.mis_total}</GCell>
                                    <GCell group="mis">{batch.mis_pending}</GCell>
                                    <GCell group="mis">{batch.mis_delivered}</GCell>
                                    <GCell group="mis">{batch.mis_accepted}</GCell>
                                    <GCell group="mis">{batch.mis_client_rejected}</GCell>
                                    <GCell group="mis">{batch.mis_rtd}</GCell>
                                    <GCell group="mis">{batch.mis_internal_rejected}</GCell>

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
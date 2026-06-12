import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "src/components/ui/tooltip";

import { SentinelBatch, SentinelCampaignService } from "../services/SentinelCampaignService";
import { Download } from "lucide-react";
import { useNavigate } from "react-router";

interface Props {
    data: SentinelBatch[];
    loading: boolean;
}

const SEGMENT_WIDTH = 180;
const TITLE_WIDTH = 300;
const TITLE_LEFT = SEGMENT_WIDTH;

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

const stickyTitle: React.CSSProperties = {
    position: "sticky",
    left: `${TITLE_LEFT}px`,
    width: `${TITLE_WIDTH}px`,
    minWidth: `${TITLE_WIDTH}px`,
    maxWidth: `${TITLE_WIDTH}px`,
    zIndex: 20,          // ✅ inline z — wins over everything
};

// Lower z for body rows so header rows always win
const stickySegmentBody: React.CSSProperties = { ...stickySegment, zIndex: 20 };
const stickyTitleBody: React.CSSProperties = { ...stickyTitle, zIndex: 20 };

const SentinelCampaignsTable = ({ data, loading }: Props) => {
    const navigate = useNavigate();
    const handleNavigate = (campaign_code: string) => {
        navigate(`/sentinel-segments?search=${encodeURIComponent(campaign_code.trim())}`);
    };
    const downloadFile = async (
        campaignCode: string,
        metric: string,
        department: string
    ) => {
        try {
            const blob = await SentinelCampaignService.exportCampaignData(
                campaignCode,
                metric,
                department
            );

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${campaignCode}_${department}_${metric}.csv`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    const GCell = ({
        children,
        isFirst = false,
        group,
        className = "",
        metric,
        department,
        campaignCode,
    }: {
        children: React.ReactNode;
        isFirst?: boolean;
        group: keyof typeof GROUP;
        className?: string;
        metric: string;
        department: string;
        campaignCode: string;
    }) => {
        const hasValue = Number(children) > 0;

        return (
            <TableCell
                className={`text-center border-b border-r p-0 ${GROUP[group].bodyBg} ${GROUP[group].border} ${isFirst ? `border-l-2 ${GROUP[group].border}` : ""
                    } ${className}`}
            >
                {hasValue ? (
                    <button
                        type="button"
                        onClick={() =>
                            downloadFile(campaignCode, metric, department)
                        }
                        className="w-full min-h-10 flex items-center justify-center group/btn"
                    >
                        <span className="text-sm font-medium tabular-nums transition-all duration-200 ease-out group-hover/btn:opacity-0 group-hover/btn:scale-75">
                            {children}
                        </span>

                        <Download
                            size={14}
                            strokeWidth={1.75}
                            className={`absolute opacity-0 scale-75 transition-all duration-200 ease-out group-hover/btn:opacity-100 group-hover/btn:scale-100 ${GROUP[group].text}`}
                        />
                    </button>
                ) : (
                    <span className="flex items-center justify-center min-h-10 text-sm font-medium">
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
                    Loading Sentinel Campaigns...
                </div>
            ) : data.length === 0 ? (
                <div className="h-96 flex items-center justify-center text-muted-foreground text-lg font-bold">
                    No Campagins found.
                </div>
            ) : (
                <div className="overflow-x-auto" style={{ position: "relative" }}>
                    <Table style={{ minWidth: "2600px", borderCollapse: "separate", borderSpacing: 0 }}>
                        <TableHeader>
                            <TableRow>
                                <TableHead rowSpan={2} className="text-center font-semibold border-b-2 border-r-2 border-border bg-muted" style={stickySegment}>
                                    Campaign Code
                                </TableHead>
                                <TableHead rowSpan={2} className="text-center font-semibold border-b-2 border-r-2 border-border bg-muted" style={stickyTitle}>
                                    Title
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
                                <TableRow key={batch.segment_code} className="odd:bg-transparent even:bg-muted/50 hover:bg-muted/50">
                                    <TableCell
                                        className="font-medium text-primary cursor-pointer text-center border-b border-r-2 border-border bg-background hover:underline"
                                        style={stickySegmentBody}
                                        onClick={() => handleNavigate(batch.campaign_code)} >
                                        {batch.campaign_code}
                                    </TableCell>

                                    <TableCell className="border-b border-r-2 border-border bg-background" style={stickyTitleBody}>
                                        {batch.title && batch.title.length > 35 ? (
                                            <TooltipProvider delayDuration={200}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="truncate cursor-pointer">
                                                            {batch.title.slice(0, 35)}...
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{batch.title}</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <div className="truncate">{batch.title || "-"}</div>
                                        )}
                                    </TableCell>

                                    <GCell isFirst group="dataops" metric="total" department="DataOps" campaignCode={batch.campaign_code} >
                                        {batch.dataops_total}
                                    </GCell>
                                    <GCell group="dataops" metric="valid" department="DataOps" campaignCode={batch.campaign_code} >
                                        {batch.dataops_valid}
                                    </GCell>
                                    <GCell group="dataops" metric="invalid" department="DataOps" campaignCode={batch.campaign_code} >
                                        {batch.dataops_invalid}
                                    </GCell>

                                    <GCell isFirst group="email" metric="total" department="Email" campaignCode={batch.campaign_code} >
                                        {batch.email_total}
                                    </GCell>

                                    <GCell group="email" metric="pending" department="Email" campaignCode={batch.campaign_code} >
                                        {batch.email_pending}
                                    </GCell>

                                    <GCell group="email" metric="valid" department="Email" campaignCode={batch.campaign_code} >
                                        {batch.email_valid}
                                    </GCell>

                                    <GCell group="email" metric="invalid" department="Email" campaignCode={batch.campaign_code} >
                                        {batch.email_invalid}
                                    </GCell>

                                    <GCell isFirst group="quality" metric="total" department="Quality" campaignCode={batch.campaign_code} >
                                        {batch.quality_total}
                                    </GCell>

                                    <GCell group="quality" metric="pending" department="Quality" campaignCode={batch.campaign_code} >
                                        {batch.quality_pending}
                                    </GCell>

                                    <GCell group="quality" metric="valid" department="Quality" campaignCode={batch.campaign_code} >
                                        {batch.quality_valid}
                                    </GCell>

                                    <GCell group="quality" metric="invalid" department="Quality" campaignCode={batch.campaign_code} >
                                        {batch.quality_invalid}
                                    </GCell>

                                    <GCell isFirst group="dbr" metric="total" department="DBR" campaignCode={batch.campaign_code} >
                                        {batch.dbr_total}
                                    </GCell>

                                    <GCell group="dbr" metric="pending" department="DBR" campaignCode={batch.campaign_code} >
                                        {batch.dbr_pending}
                                    </GCell>

                                    <GCell group="dbr" metric="valid" department="DBR" campaignCode={batch.campaign_code} >
                                        {batch.dbr_valid}
                                    </GCell>

                                    <GCell group="dbr" metric="invalid" department="DBR" campaignCode={batch.campaign_code} >
                                        {batch.dbr_invalid}
                                    </GCell>

                                    <GCell isFirst group="vv" metric="total" department="VV" campaignCode={batch.campaign_code} >
                                        {batch.vv_total}
                                    </GCell>

                                    <GCell group="vv" metric="pending" department="VV" campaignCode={batch.campaign_code} >
                                        {batch.vv_pending}
                                    </GCell>

                                    <GCell group="vv" metric="valid" department="VV" campaignCode={batch.campaign_code} >
                                        {batch.vv_valid}
                                    </GCell>

                                    <GCell group="vv" metric="invalid" department="VV" campaignCode={batch.campaign_code} >
                                        {batch.vv_invalid}
                                    </GCell>

                                    <GCell isFirst group="mis" metric="total" department="MIS" campaignCode={batch.campaign_code} >
                                        {batch.mis_total}
                                    </GCell>

                                    <GCell group="mis" metric="pending" department="MIS" campaignCode={batch.campaign_code} >
                                        {batch.mis_pending}
                                    </GCell>

                                    <GCell group="mis" metric="delivered" department="MIS" campaignCode={batch.campaign_code} >
                                        {batch.mis_delivered}
                                    </GCell>

                                    <GCell group="mis" metric="accepted" department="MIS" campaignCode={batch.campaign_code} >
                                        {batch.mis_accepted}
                                    </GCell>

                                    <GCell group="mis" metric="client_rejected" department="MIS" campaignCode={batch.campaign_code} >
                                        {batch.mis_client_rejected}
                                    </GCell>

                                    <GCell group="mis" metric="rtd" department="MIS" campaignCode={batch.campaign_code} >
                                        {batch.mis_rtd}
                                    </GCell>

                                    <GCell group="mis" metric="internal_rejected" department="MIS" campaignCode={batch.campaign_code} >
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

export default SentinelCampaignsTable
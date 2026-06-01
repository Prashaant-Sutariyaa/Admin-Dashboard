import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "src/components/ui/tooltip";
import { Trash2, Plus } from 'lucide-react';
import StatusBadge from 'src/components/shared/status-badges/StatusBadge';
import { CAMPAIGN_STATUS_OPTIONS } from 'src/config/constant-data/campaignOptions';
import { toast } from 'sonner';
import { useConfirm } from 'src/components/shared/confirmdialog/confirm-context';
import { campaignSegmentService } from '../services/campaignSegmentService';
import { formatDateShort } from 'src/utils/formatDateShort';
import UnrealizedReasonDialog from "./dialog";
import { useState } from 'react';
import { campaignService } from "../../manageCampaigns/services/campaignService";
interface Props {
    campaignId: number | undefined;
    campaign: any;
    segments: any[];
    setSegments: (data: any[]) => void;
    isEditing: boolean;
    setIsEditing: (v: boolean) => void;
    originalSegments: any[];
    setSelectedCampaign: (data: any) => void;
}

const CampSegmentTable = ({ originalSegments, campaignId, campaign, segments, setSegments, isEditing, setIsEditing, setSelectedCampaign }: Props) => {

    const confirm = useConfirm();
    const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
    const [pendingRows, setPendingRows] = useState<any[]>([]);
    const getDeficit = (row: any) => Number(row.allocation || 0) - Number(row.accepted || 0);
    const getTBD = (row: any) => Number(row.delivered || 0) - (Number(row.accepted || 0) + Number(row.rejected || 0));

    const handleChange = (index: number, field: string, value: any) => {
        const updated = [...segments];
        if (['allocation', 'delivered', 'accepted', 'rejected'].includes(field)) {
            let numericValue = Number(value);
            if (field === 'accepted') {
                const delivered = Number(updated[index].delivered || 0);
                numericValue = Math.min(numericValue, delivered);
            }
            updated[index][field] = numericValue;
        }
        else {
            updated[index][field] = value;
        }
        setSegments(updated);
    };

    const handleAddRow = () => {
        setSegments([
            ...segments,
            {
                title: campaign?.campaign_name, // 🔥 auto title
                segment_start_date: campaign?.start_date || '',
                segment_end_date: campaign?.end_date || '',
                allocation: 0,
                delivered: 0,
                accepted: 0,
                rejected: 0,
                status: 'Not Started',
                unrealized_reason: "",
            }
        ]);
    };
    const handleDelete = async (index: number) => {
        const ok = await confirm({
            title: 'Remove segment?',
            description: 'This segment will be removed.',
            confirmText: 'Remove',
            variant: 'destructive',
        });

        if (!ok) return;
        const updated = [...segments];
        updated.splice(index, 1);
        setSegments(updated);
    };

    const handleSave = async (updatedSegments?: any[]) => {
        try {
            const finalSegments = updatedSegments || segments;
            // ✅ preserve original index
            const rowsNeedingReason =
                finalSegments
                    .map((s, index) => ({
                        ...s,
                        rowIndex: index,
                        deficit: getDeficit(s),
                    }))
                    .filter((s) => s.status === "Completed" && s.deficit !== 0);
            // ✅ open dialog first
            if (
                rowsNeedingReason.length > 0 &&
                !updatedSegments
            ) {
                setPendingRows(rowsNeedingReason);
                setReasonDialogOpen(true);
                return;
            }
            // ✅ final payload
            const cleaned = finalSegments.map((s) => ({
                id: s.id,
                title: s.title,
                segment_start_date: s.segment_start_date,
                segment_end_date: s.segment_end_date,
                allocation: Number(s.allocation || 0),
                delivered: Number(s.delivered || 0),
                accepted: Number(s.accepted || 0),
                rejected: Number(s.rejected || 0),
                status: s.status,
                unrealized_reason: s.unrealized_reason || null,
            }));
            await campaignSegmentService.bulkUpdate({
                campaign_id: campaignId,
                segments: cleaned,
            });
            toast.success("Segments updated successfully");
            setIsEditing(false);
            setReasonDialogOpen(false);
            if (campaignId) {

                const updatedCampaign =
                    await campaignService.getCampaignById(
                        campaignId
                    );

                setSelectedCampaign(
                    updatedCampaign
                );
            }
        } catch (e: any) {
            toast.error(
                e?.response?.data?.detail ||
                "Failed"
            );
        }
    };

    const handleReasonSubmit = (reasons: Record<number, string>) => {
        const updated = [...segments];
        pendingRows.forEach((row, idx) => {
            updated[row.rowIndex] = { ...updated[row.rowIndex], unrealized_reason: reasons[idx] };
        });

        setSegments(updated);
        handleSave(updated);
    };

    const handleCancel = () => {
        setSegments(originalSegments); // 🔥 reset everything
        setIsEditing(false);
    };

    return (
        <div className="overflow-x-auto border border-border rounded-md mt-6">
            {isEditing && (
                <div className="flex justify-end gap-2 p-3">
                    <Button variant="lighterror" onClick={handleCancel}>Cancel</Button>
                    <Button variant="lightprimary" onClick={() => handleSave()}>Save</Button>
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Segment</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead>Allocation</TableHead>
                        <TableHead>Delivered</TableHead>
                        <TableHead>Accepted</TableHead>
                        <TableHead>Rejected</TableHead>
                        <TableHead>Deficit</TableHead>
                        <TableHead>TBD</TableHead>
                        <TableHead>Status</TableHead>
                        {isEditing && <TableHead>Actions</TableHead>}
                    </TableRow>
                </TableHeader>

                <TableBody>

                    {segments.map((s, i) => (
                        <TableRow key={i}>

                            <TableCell className="min-w-48">

                                {isEditing ? (
                                    <Input
                                        className="text-xs"
                                        value={s.title}
                                        onChange={(e) =>
                                            handleChange(i, "title", e.target.value)
                                        }
                                    />
                                ) : (
                                    <>
                                        {s.title?.length > 50 ? (
                                            <TooltipProvider delayDuration={200}>
                                                <Tooltip>

                                                    <TooltipTrigger asChild>
                                                        <div className="truncate cursor-pointer max-w-[180px]">
                                                            {s.title.slice(0, 50)}...
                                                        </div>
                                                    </TooltipTrigger>

                                                    <TooltipContent>
                                                        {s.title}
                                                    </TooltipContent>

                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <div>{s.title}</div>
                                        )}

                                        <div className="text-xs text-primary">
                                            {s.segment_code}
                                        </div>
                                    </>
                                )}

                            </TableCell>

                            <TableCell>
                                {isEditing ? (
                                    <Input
                                        className='text-xs'
                                        type="date"
                                        min={campaign?.start_date}
                                        max={campaign?.end_date}
                                        value={s.segment_start_date}
                                        onChange={(e) => handleChange(i, 'segment_start_date', e.target.value)}
                                    />
                                ) : formatDateShort(s.segment_start_date)}
                            </TableCell>

                            <TableCell>
                                {isEditing ? (
                                    <Input
                                        className='text-xs'
                                        type="date"
                                        min={campaign?.start_date}
                                        max={campaign?.end_date}
                                        value={s.segment_end_date}
                                        onChange={(e) => handleChange(i, 'segment_end_date', e.target.value)}
                                    />
                                ) : formatDateShort(s.segment_end_date)}
                            </TableCell>

                            {['allocation', 'delivered', 'accepted', 'rejected'].map((f) => (
                                <TableCell key={f}>
                                    {isEditing ? (
                                        <Input className='text-xs min-w-18' type="number" min="0" value={s[f]} onChange={(e) => handleChange(i, f, e.target.value)} />
                                    ) : s[f]}
                                </TableCell>
                            ))}

                            <TableCell className={getDeficit(s) === 0 ? 'text-successemphasis' : 'text-error'}>
                                {getDeficit(s)}
                            </TableCell>

                            <TableCell className={getTBD(s) === 0 ? '' : 'text-successemphasis'}>
                                {getTBD(s)}
                            </TableCell>

                            <TableCell>
                                {isEditing ? (
                                    <Select value={s.status} onValueChange={(v) => handleChange(i, 'status', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {CAMPAIGN_STATUS_OPTIONS.map(opt => {
                                                // const disableCompleted =
                                                //     opt.value === 'Completed' &&
                                                //     (getDeficit(s) !== 0 || Number(s.allocation) === 0);

                                                return (
                                                    <SelectItem key={opt.value} value={opt.value} /* disabled={disableCompleted} */>
                                                        {opt.label}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                ) : <StatusBadge value={s.status} />}
                            </TableCell>

                            {isEditing && (
                                <TableCell >
                                    <Button variant="lighterror" size="sm" onClick={() => handleDelete(i)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </TableCell>
                            )}

                        </TableRow>
                    ))}

                    {isEditing && (
                        <TableRow>
                            <TableCell colSpan={11} className="text-center">
                                <Button variant="outline" size="sm" onClick={handleAddRow}>
                                    <Plus size={14} /> Add Segment
                                </Button>
                            </TableCell>
                        </TableRow>
                    )}

                </TableBody>
            </Table>
            <UnrealizedReasonDialog
                open={reasonDialogOpen}
                rows={pendingRows}
                onClose={() => {
                    setReasonDialogOpen(false);
                }}
                onSubmit={handleReasonSubmit}
            />
        </div>
    );
};

export default CampSegmentTable;
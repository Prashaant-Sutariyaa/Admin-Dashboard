import { useEffect, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';

import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';

import StatusBadge from 'src/components/shared/status-badges/StatusBadge';
import { campaignService } from '../services/campaignService';
import { CAMPAIGN_STATUS_OPTIONS } from 'src/config/constant-data/campaignOptions';
import { toast } from 'sonner';
import Can from 'src/permissions/CanPermission';

interface Props {
  campaignId: number | undefined;
}

const SegmentTable = ({ campaignId }: Props) => {
  const [segments, setSegments] = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<any>({});
  const [newRow, setNewRow] = useState<any | null>(null);

  const loadSegments = async () => {
    if (!campaignId) return;
    try {
      const data = await campaignService.getSegmentsByCampaignId(campaignId);
      setSegments(data || []);
    } catch {
      setSegments([]);
    }
  };

  const loadCampaign = async () => {
    if (!campaignId) return;
    try {
      const data = await campaignService.getCampaignById(campaignId);
      setCampaign(data);
    } catch {
      setCampaign(null);
    }
  };

  useEffect(() => {
    setSegments([]);
    if (campaignId) {
      loadSegments();
      loadCampaign();
    }
  }, [campaignId]);

  const handleChange = (field: string, value: any) => {
    if (editingId) {
      setEditedRow((prev: any) => ({ ...prev, [field]: value }));
    } else {
      setNewRow((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    }
  };

  const getDeficit = (row: any) =>
    Number(row.allocation || 0) - Number(row.delivered || 0);

  const validateRow = (row: any) => {
    if (
      !row.title ||
      !row.segment_start_date ||
      !row.segment_end_date ||
      row.allocation === '' ||
      row.delivered === '' ||
      row.accepted === '' ||
      row.rejected === '' ||
      !row.status
    ) {
      toast.error('Please fill all the fields');
      return false;
    }

    if (row.segment_start_date > row.segment_end_date) {
      toast.error('Start date cannot be after end date');
      return false;
    }

    if (
      Number(row.allocation) < 0 ||
      Number(row.delivered) < 0 ||
      Number(row.accepted) < 0 ||
      Number(row.rejected) < 0
    ) {
      toast.error('Negative values are not allowed');
      return false;
    }

    if (getDeficit(row) !== 0 && row.status === 'Completed') {
      toast.error('Cannot mark as Completed until deficit is 0');
      return false;
    }

    return true;
  };

  const handleAdd = () => {
    if (newRow) return;

    setNewRow({
      title: '',
      segment_start_date: '',
      segment_end_date: '',
      allocation: '',
      delivered: '',
      accepted: '',
      rejected: '',
      status: '',
    });

    setEditingId(null);
  };

  const handleEdit = (row: any) => {
    setEditingId(row.id);
    setEditedRow({ ...row });
    setNewRow(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedRow({});
    setNewRow(null);
  };

  const handleSave = async () => {
    try {
      if (newRow) {
        if (!validateRow(newRow)) return;

        const payload = {
          ...newRow,
          campaign_id: campaignId,
          allocation: Number(newRow.allocation),
          delivered: Number(newRow.delivered),
          accepted: Number(newRow.accepted),
          rejected: Number(newRow.rejected),
        };

        await campaignService.createSegment(payload);
        toast.success('Segment created');
      } else if (editingId) {
        if (!validateRow(editedRow)) return;

        const original = segments.find((s) => s.id === editingId);

        const payload: any = {};
        Object.keys(editedRow).forEach((key) => {
          if (editedRow[key] !== original[key]) {
            payload[key] = editedRow[key];
          }
        });

        if (Object.keys(payload).length === 0) {
          toast.info('No changes detected');
          handleCancel();
          return;
        }

        await campaignService.updateSegment(editingId, payload);
        toast.success('Segment updated');
      }

      handleCancel();
      loadSegments();
    } catch (e: any) {
      const msg = e?.response?.data?.detail;

      if (msg === 'Segment title already exists for this campaign') {
        toast.error('Segment title already exists for this campaign');
      } else if (msg === 'Segment exists but is deleted. Restore instead of updating.') {
        toast.error('Segment exists but is deleted. Restore instead.');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  const handleDelete = async (id: number) => {
    await campaignService.deleteSegment(id);
    toast.success('Segment deleted');
    loadSegments();
  };

  const renderText = (field: string, value: any) => (
    <Input
      value={value || ''}
      onChange={(e) => handleChange(field, e.target.value)}
      onKeyDown={handleKeyDown}
      className="h-8 text-sm"
    />
  );

  const renderNumber = (field: string, value: any) => (
    <Input
      type="number"
      min="0"
      value={value || ''}
      onChange={(e) => handleChange(field, e.target.value)}
      onKeyDown={handleKeyDown}
      className="h-8 text-center text-sm"
    />
  );

  const renderDate = (field: string, value: any, row: any) => {
    const isStart = field === 'segment_start_date';
    const isEnd = field === 'segment_end_date';

    return (
      <Input
        type="date"
        value={value || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-8 text-sm"
        min={
          isStart
            ? campaign?.start_date
            : row.segment_start_date || campaign?.start_date
        }
        max={
          isEnd
            ? campaign?.end_date
            : row.segment_end_date || campaign?.end_date
        }
      />
    );
  };

  return (
    <div className="mt-6 border border-border rounded-md p-4">

      <Can module="Campaign_segment" action="create">
        <div className="flex justify-end mb-3">
          <Button size="sm" onClick={handleAdd}>
            <Plus className="size-4" />
          </Button>
        </div>
      </Can>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center text-xs">Code</TableHead>
            <TableHead className="min-w-[180px] text-xs">Title</TableHead>
            <TableHead className="text-center text-xs">Start</TableHead>
            <TableHead className="text-center text-xs">End</TableHead>
            <TableHead className="text-center text-xs">Allocation</TableHead>
            <TableHead className="text-center text-xs">Delivered</TableHead>
            <TableHead className="text-center text-xs">Accepted</TableHead>
            <TableHead className="text-center text-xs">Rejected</TableHead>
            <TableHead className="text-center text-xs">Deficit</TableHead>
            <TableHead className="text-center text-xs">Status</TableHead>
            <Can module="Campaign_segment" actions={['create', 'edit', 'delete']}>
              <TableHead className="text-center text-xs">Actions</TableHead>
            </Can>
          </TableRow>
        </TableHeader>

        <TableBody>

          {newRow && (
            <TableRow>
              <TableCell className="text-center text-xs">—</TableCell>

              <TableCell>{renderText('title', newRow.title)}</TableCell>
              <TableCell>{renderDate('segment_start_date', newRow.segment_start_date, newRow)}</TableCell>
              <TableCell>{renderDate('segment_end_date', newRow.segment_end_date, newRow)}</TableCell>

              <TableCell>{renderNumber('allocation', newRow.allocation)}</TableCell>
              <TableCell>{renderNumber('delivered', newRow.delivered)}</TableCell>
              <TableCell>{renderNumber('accepted', newRow.accepted)}</TableCell>
              <TableCell>{renderNumber('rejected', newRow.rejected)}</TableCell>

              <TableCell className="text-center">
                {getDeficit(newRow)}
              </TableCell>

              <TableCell>
                <Select onValueChange={(v) => handleChange('status', v)}>
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_STATUS_OPTIONS.map((s) => {
                      const disableCompleted =
                        s.value === 'Completed' && getDeficit(newRow) !== 0;

                      return (
                        <SelectItem key={s.value} value={s.value} disabled={disableCompleted}>
                          {s.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </TableCell>

              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button size="sm" variant="lightprimary" onClick={handleSave}>
                    <Check size={14} />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}

          {segments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                No Segments Found
              </TableCell>
            </TableRow>
          ) : (
            segments.map((s) => {
              const isEditing = editingId === s.id;

              return (
                <TableRow key={s.id} className="even:bg-lightprimary/80">

                  <TableCell className="text-center text-primary font-semibold text-xs">
                    {s.segment_code}
                  </TableCell>

                  <TableCell className="min-w-[180px] text-sm">
                    {isEditing ? (
                      renderText('title', editedRow.title)
                    ) : s.title?.length > 40 ? (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate max-w-[180px] cursor-pointer">
                              {s.title.slice(0, 40)}.....
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {s.title}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span>{s.title}</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center text-sm">
                    {isEditing
                      ? renderDate('segment_start_date', editedRow.segment_start_date, editedRow)
                      : s.segment_start_date}
                  </TableCell>

                  <TableCell className="text-center text-sm">
                    {isEditing
                      ? renderDate('segment_end_date', editedRow.segment_end_date, editedRow)
                      : s.segment_end_date}
                  </TableCell>

                  <TableCell className="text-center">
                    {isEditing ? renderNumber('allocation', editedRow.allocation) : s.allocation}
                  </TableCell>

                  <TableCell className="text-center">
                    {isEditing ? renderNumber('delivered', editedRow.delivered) : s.delivered}
                  </TableCell>

                  <TableCell className="text-center">
                    {isEditing ? renderNumber('accepted', editedRow.accepted) : s.accepted}
                  </TableCell>

                  <TableCell className="text-center">
                    {isEditing ? renderNumber('rejected', editedRow.rejected) : s.rejected}
                  </TableCell>

                  <TableCell className="text-center">
                    {isEditing ? getDeficit(editedRow) : getDeficit(s)}
                  </TableCell>

                  <TableCell className="text-center">
                    {isEditing ? (
                      <Select
                        value={editedRow.status}
                        onValueChange={(v) => handleChange('status', v)}
                      >
                        <SelectTrigger className="h-8 w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CAMPAIGN_STATUS_OPTIONS.map((opt) => {
                            const disableCompleted =
                              opt.value === 'Completed' && getDeficit(editedRow) !== 0;

                            return (
                              <SelectItem key={opt.value} value={opt.value} disabled={disableCompleted}>
                                {opt.label}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <StatusBadge value={s.status as any} />
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" variant="lightprimary" onClick={handleSave}>
                            <Check size={14} />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X size={14} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Can module="Campaign_segment" action="edit">
                            <Button size="sm" variant="lightprimary" onClick={() => handleEdit(s)}>
                              <Pencil size={14} />
                            </Button>
                          </Can>
                          <Can module="Campaign_segment" action="delete">
                            <Button size="sm" variant="lighterror" onClick={() => handleDelete(s.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </Can>
                        </>
                      )}
                    </div>
                  </TableCell>

                </TableRow>
              );
            })
          )}

        </TableBody>
      </Table>
    </div>
  );
};

export default SegmentTable;
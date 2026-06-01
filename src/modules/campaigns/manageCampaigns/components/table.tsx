import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from 'src/components/ui/table';

import { Button } from 'src/components/ui/button';
import { Pencil, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';

import { Campaign, campaignService } from '../services/campaignService';
import StatusBadge from 'src/components/shared/status-badges/StatusBadge';
import Can from 'src/permissions/CanPermission';
import { formatDateShort } from 'src/utils/formatDateShort';

const CampaignTable = ({ campaigns, onEdit, onDelete }: any) => {
  const navigate = useNavigate();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-x-auto border border-border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Start</TableHead>
              <TableHead className="text-center">End</TableHead>
              <TableHead className="text-center">Allocation</TableHead>
              <TableHead className="text-center">Delivered</TableHead>
              <TableHead className="text-center">Accepted</TableHead>
              <TableHead className="text-center">Rejected</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Segments</TableHead>

              <Can module="campaign" actions={['edit', 'delete', 'download']}>
                <TableHead className="text-center">Actions</TableHead>
              </Can>
            </TableRow>
          </TableHeader>

          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">

                    <span className="text-lg font-medium text-foreground">
                      No Campaigns Found
                    </span>

                    <span className="text-sm">
                      You haven’t created any campaigns yet.
                    </span>

                  </div>
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((c: Campaign) => (
                <TableRow
                  key={c.id}
                  className="even:bg-lightprimary/80 cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/campaigns/details/${c.id}`)}
                >
                  <TableCell className="">
                    {/* NAME */}
                    <div>
                      {c.campaign_name?.length > 20 ? (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-block max-w-[180px] truncate cursor-pointer">
                                {c.campaign_name.slice(0, 20)}...
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {c.campaign_name}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        c.campaign_name
                      )}
                    </div>

                    {/* CODE */}
                    <div className="text-xs font-semibold text-primary mt-1">
                      {c.code}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {c.campaign_type}
                  </TableCell>

                  <TableCell className="text-center">
                    {formatDateShort(c.start_date)}
                  </TableCell>

                  <TableCell className="text-center">
                    {formatDateShort(c.end_date)}
                  </TableCell>

                  <TableCell className="text-center">
                    {c.total_allocation}
                  </TableCell>

                  <TableCell className="text-center">
                    {c.total_delivered}
                  </TableCell>

                  <TableCell className="text-center">
                    {c.total_accepted}
                  </TableCell>

                  <TableCell className="text-center">
                    {c.total_rejected}
                  </TableCell>

                  <TableCell className="text-center">
                    <StatusBadge value={c.status as any} />
                  </TableCell>

                  <TableCell
                    className="text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/campaigns-segment?campaignId=${c.id}`);
                    }}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-full bg-lightprimary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors">
                          {c.total_segments}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Edit segments</TooltipContent>
                    </Tooltip>
                  </TableCell>

                  {/* ✅ Actions Column */}
                  <TableCell
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center gap-2">
                      <Can module="campaign" action="download">
                        {/* 🔹 Download */}
                        {c.campaign_document_name && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="lightinfo"
                                onClick={() => campaignService.downloadDocument(c.id)}
                              >
                                <Download className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {c.campaign_document_name}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </Can>

                      {/* 🔹 Edit */}
                      <Can module="campaign" action="edit">
                        <Button
                          size="sm"
                          variant="lightprimary"
                          onClick={() => onEdit(c)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </Can>

                      {/* 🔹 Delete */}
                      <Can module="campaign" action="delete">
                        <Button
                          size="sm"
                          variant="lighterror"
                          onClick={() => onDelete(c)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </Can>

                    </div>
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default CampaignTable;
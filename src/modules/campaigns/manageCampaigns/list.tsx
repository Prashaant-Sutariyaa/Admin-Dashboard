import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { CAMPAIGN_STATUS_OPTIONS } from 'src/config/constant-data/campaignOptions';
import CampaignTable from './components/table';
import CampaignDialog from './components/dialogForm';

import { campaignService, Campaign } from './services/campaignService';
import { clientService, Client } from 'src/modules/clients/services/clientService';
import SharedPagination from 'src/components/shared/pagination/SharedPagination';

import { useConfirm } from 'src/components/shared/confirmdialog/confirm-context';
import { toast } from 'sonner';
import Can from 'src/permissions/CanPermission';

const CampaignList = () => {

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [status, setStatus] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const confirm = useConfirm();

  const loadAll = async () => {
    const [campaignRes, clientData] = await Promise.all([
      campaignService.getCampaigns(page, limit, status),
      clientService.getAllActiveClients(),
    ]);

    setCampaigns(campaignRes.data || []);
    setTotal(campaignRes.total || 0);
    setClients(clientData);
  };

  const openCreate = () => {
    setDialogMode('create');
    setSelectedCampaign(null);
    setDialogOpen(true);
  };

  const openEdit = async (campaign: Campaign) => {
    const full = await campaignService.getCampaignById(campaign.id);
    setDialogMode('edit');
    setSelectedCampaign(full);
    setDialogOpen(true);
  };

  const handleDelete = async (campaign: Campaign) => {
    const ok = await confirm({
      title: 'Delete campaign?',
      description: 'This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    });

    if (!ok) return;

    await campaignService.deleteCampaign(campaign.id);
    toast.success('Campaign deleted');
    loadAll();
  };

  useEffect(() => {
    loadAll();
  }, [page, limit, status]);

  return (
    <>
      <SlimBreadcrumb title="Campaigns" items={[{ title: 'Campaigns' }]} />

      <CardBox>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {CAMPAIGN_STATUS_OPTIONS.map(
                  (item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <Can module="campaign" actions={['create']}>
            <Button variant="lightprimary" onClick={openCreate}>
              <Icon icon="solar:add-circle-linear" width={18} />
              Create Campaign
            </Button>
          </Can>
        </div>

        <CampaignTable
          campaigns={campaigns}
          clients={clients}
          onEdit={openEdit}
          onDelete={handleDelete}
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

      <CampaignDialog
        key={selectedCampaign?.id ?? 'create'}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          loadAll();
        }}
        mode={dialogMode}
        campaign={selectedCampaign || undefined}
        clients={clients}
      />
    </>
  );
};

export default CampaignList;
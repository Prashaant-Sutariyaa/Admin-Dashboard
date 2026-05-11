import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';

import CampaignTable from './components/table';
import CampaignDialog from './components/dialogForm';

import { campaignService, Campaign } from './services/campaignService';
import { clientService, Client } from 'src/modules/clients/services/clientService';
import Pagination from 'src/modules/reports/revenue/components/pagination';

import { useConfirm } from 'src/components/shared/confirmdialog/confirm-context';
import { toast } from 'sonner';
import Can from 'src/permissions/Can';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const confirm = useConfirm();

  const loadAll = async () => {
    const [campaignData, clientData] = await Promise.all([
      campaignService.getCampaigns(),
      clientService.getAllActiveClients(),
    ]);

    setCampaigns(campaignData);
    setClients(clientData);
  };

  useEffect(() => {
    loadAll();
  }, []);

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

  return (
    <>
      <SlimBreadcrumb title="Campaigns" items={[{ title: 'Campaigns' }]} />

      <CardBox>
        <div className="flex items-center justify-between mb-4">
          <h5 className="card-title">Campaigns List</h5>

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
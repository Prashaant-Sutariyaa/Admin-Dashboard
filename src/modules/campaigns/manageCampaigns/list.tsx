import { useEffect, useState } from 'react';

import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';

import CardBox from 'src/components/shared/CardBox';

import CampaignTable from './components/table';

import CampaignDialog from './components/dialogForm';

import CampaignFilters from './components/CampaignFilters';

import {
  campaignService,
  Campaign
} from './services/campaignService';

import {
  clientService,
  Client
} from 'src/modules/clients/services/clientService';

import SharedPagination from 'src/components/shared/pagination/SharedPagination';

import { useConfirm } from 'src/components/shared/confirmdialog/confirm-context';

import { toast } from 'sonner';

const CampaignList = () => {

  const [campaigns, setCampaigns] =
    useState<Campaign[]>([]);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [page, setPage] =
    useState(1);

  const [limit, setLimit] =
    useState(20);

  const [total, setTotal] =
    useState(0);

  const [filters, setFilters] =
    useState<any>({});

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [dialogMode, setDialogMode] =
    useState<'create' | 'edit'>('create');

  const [selectedCampaign, setSelectedCampaign] =
    useState<Campaign | null>(null);

  const confirm =
    useConfirm();

  const loadAll = async () => {

    const [
      campaignRes,
      clientData
    ] = await Promise.all([

      campaignService.getCampaigns(
        page,
        limit,
        filters.status,
        filters.search,
        filters.start_date,
        filters.end_date,
      ),

      clientService.getAllActiveClients(),
    ]);

    setCampaigns(
      campaignRes.data || []
    );

    setTotal(
      campaignRes.total || 0
    );

    setClients(
      clientData
    );
  };

  useEffect(() => {
    loadAll();
  }, [
    page,
    limit,
    filters,
  ]);

  const openCreate = () => {

    setDialogMode('create');

    setSelectedCampaign(null);

    setDialogOpen(true);
  };

  const openEdit = async (
    campaign: Campaign
  ) => {

    const full =
      await campaignService.getCampaignById(
        campaign.id
      );

    setDialogMode('edit');

    setSelectedCampaign(full);

    setDialogOpen(true);
  };

  const handleDelete = async (
    campaign: Campaign
  ) => {

    const ok =
      await confirm({

        title:
          'Delete campaign?',

        description:
          'This action cannot be undone.',

        confirmText:
          'Delete',

        variant:
          'destructive',
      });

    if (!ok) return;

    await campaignService.deleteCampaign(
      campaign.id
    );

    toast.success(
      'Campaign deleted'
    );

    loadAll();
  };

  const handleApplyFilters = (
    values: any
  ) => {

    setFilters(values);

    setPage(1);
  };

  return (
    <>
      <SlimBreadcrumb
        title="Campaigns"
        items={[
          { title: 'Campaigns' }
        ]}
      />

      <CardBox>

        {/* FILTER */}
        <CampaignFilters
          onApply={handleApplyFilters}
          onCreate={openCreate}
        />

        {/* TABLE */}
        <div className="mt-4">

          <CampaignTable
            campaigns={campaigns}
            clients={clients}
            onEdit={openEdit}
            onDelete={handleDelete}
          />

        </div>

        {/* PAGINATION */}
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

      {/* DIALOG */}
      <CampaignDialog
        key={
          selectedCampaign?.id ??
          'create'
        }
        open={dialogOpen}
        onClose={() => {

          setDialogOpen(false);

          loadAll();
        }}
        mode={dialogMode}
        campaign={
          selectedCampaign ||
          undefined
        }
        clients={clients}
      />

    </>
  );
};

export default CampaignList;
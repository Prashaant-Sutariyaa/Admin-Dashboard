import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';
import CardBox from 'src/components/shared/CardBox';
import StatusBadge from 'src/components/shared/status-badges/StatusBadge';

import { campaignService, Campaign } from './services/campaignService';
import { clientService, Client } from 'src/modules/clients/services/clientService';

import { Button } from 'src/components/ui/button';
import { Download } from 'lucide-react';

import img from 'src/assets/images/dashboard/campaign.png';
import DetailsTable from './components/detailsTable';
import Can from 'src/permissions/CanPermission';

const CampaignDetails = () => {
  const { id } = useParams();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  const loadData = async () => {
    if (!id) return;

    const campaignData = await campaignService.getCampaignById(Number(id));
    setCampaign(campaignData);

    const clientData = await clientService.getAllClients();
    const selected = clientData.find((c) => c.id === campaignData.client_id);
    setClient(selected || null);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (!campaign) return null;

  return (
    <>
      <SlimBreadcrumb title="Campaign Details" items={[{ title: 'Campaigns' }, { title: 'Details' }]} />

      <div className="flex flex-col gap-6">

        {/* 🔹 HEADER */}
        <CardBox className="p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full">

            {/* Image */}
            <div>
              <img
                src={img}
                alt="company"
                width={80}
                height={80}
                className="rounded-lg"
              />
            </div>

            {/* Content */}
            <div className="flex justify-between items-center w-full flex-wrap gap-4">

              {/* Left */}
              <div className="flex flex-col gap-1.5 text-center sm:text-left">
                <h5 className="card-title">
                  {campaign.campaign_name}
                </h5>

                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {campaign.code}
                  </p>

                  <div className="hidden h-4 w-px bg-border xl:block"></div>

                  <StatusBadge value={campaign.status as any} />

                  <div className="hidden h-4 w-px bg-border xl:block"></div>

                  <p className="text-sm text-muted-foreground">
                    {campaign.start_date} → {campaign.end_date}
                  </p>
                </div>
              </div>
              <Can module="campaign" action="download">
                {/* Right */}
                {campaign.campaign_document_name && (
                  <Button
                    variant="lightprimary"
                    className="flex items-center gap-2"
                    onClick={() => campaignService.downloadDocument(campaign.id)}
                  >
                    <Download className="size-4" />
                    Download Document
                  </Button>
                )}

              </Can>
            </div>
          </div>
        </CardBox>

        {/* 🔹 TWO COLUMN */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Campaign Info */}
          <CardBox className="p-6">
            <h5 className="card-title mb-6">Campaign Information</h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-muted-foreground">Campaign Type</p>
                <p>{campaign.campaign_type}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Delivery Mode</p>
                <p>{campaign.delivery_mode}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Delivery Method</p>
                <p>{campaign.delivery_method}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Client</p>
                <p>
                  {client ? `${client.code} - ${client.name}` : 'N/A'}
                </p>
              </div>

            </div>
          </CardBox>

          {/* Metrics */}
          <CardBox className="p-6">
            <h5 className="card-title mb-6">Campaign Metrics</h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-muted-foreground">Total Allocation</p>
                <p>{campaign.total_allocation}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p>{campaign.total_delivered}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Accepted</p>
                <p>{campaign.total_accepted}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p>{campaign.total_rejected}</p>
              </div>

            </div>
          </CardBox>

        </div>

        {/* 🔹 FULL WIDTH */}
        <CardBox className="p-6">
          <h5 className="card-title mb-6">Financial & Additional Info</h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <p className="text-xs text-muted-foreground">Currency</p>
              <p>{campaign.currency}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">CPL</p>
              <p>{campaign.cpl}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Priority</p>
              <StatusBadge value={campaign.priority as any} />
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Comment</p>
              <p>{campaign.comment || '—'}</p>
            </div>

          </div>
        </CardBox>
        <Can module="Campaign_segment" action="view">
          <DetailsTable campaignId={campaign.id} />
        </Can>
      </div>
    </>
  );
};

export default CampaignDetails;
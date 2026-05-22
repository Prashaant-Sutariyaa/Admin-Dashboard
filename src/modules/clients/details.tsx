import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';
import CardBox from 'src/components/shared/CardBox';
import { Download } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';
import { Button } from 'src/components/ui/button';
import { clientService, Client } from './services/clientService';
import companyImg from 'src/assets/images/dashboard/office.png';
import Can from 'src/permissions/CanPermission';
import StatusBadge from 'src/components/shared/status-badges/StatusBadge';

const ClientDetails = () => {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);

  const loadClient = async () => {
    if (!id) return;
    const data = await clientService.getClientById(Number(id));
    setClient(data);
  };

  useEffect(() => {
    loadClient();
  }, [id]);

  const BCrumb = [
    { to: '/', title: 'Home' },
    { to: '/clients', title: 'Clients' },
    { title: 'Details' },
  ];

  if (!client) return null;

  return (
    <>
      <SlimBreadcrumb title="Client Details" items={BCrumb} />

      <div className="flex flex-col gap-6">

        {/* 🔹 Header Card */}
        <CardBox className="p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full">

            {/* Image */}
            <div>
              <img
                src={companyImg}
                alt="company"
                width={80}
                height={80}
                className="rounded-lg"
              />
            </div>

            {/* Content */}
            <div className="flex justify-between items-center w-full flex-wrap gap-4">

              {/* Left Info */}
              <div className="flex flex-col gap-1.5 text-center sm:text-left">
                <h5 className="card-title">
                  {client.name}
                </h5>

                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {client.country}
                  </p>

                  <div className="hidden h-4 w-px bg-border xl:block"></div>

                  <p className="text-sm text-muted-foreground">
                    <StatusBadge value={client.isActive ? 'Active' : 'Inactive'} />
                  </p>


                  <div className="hidden h-4 w-px bg-border xl:block"></div>
                  <p className="text-sm text-muted-foreground">
                    {client.code}
                  </p>
                </div>
              </div>

              {/* ✅ Right Side Download */}
              <Can module="client" action="download">
                {client.contractFileName && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="lightprimary"
                          className="flex items-center gap-2"
                          onClick={() => clientService.downloadContract(client.id)}
                        >
                          <Download className="size-4" />
                          Download Contract
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {client.contractFileName}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </Can>

            </div>

          </div>
        </CardBox>

        {/* 🔹 Two Column Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Client Info */}
          <CardBox className="p-6">
            <h5 className="card-title mb-6">Client Information</h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-muted-foreground">Client Name</p>
                <p>{client.name}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Country</p>
                <p>{client.country}</p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Address</p>
                <p>{client.address}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p>{client.isActive ? 'Active' : 'Inactive'}</p>
              </div>

            </div>
          </CardBox>

          {/* Contact Info */}
          <CardBox className="p-6">
            <h5 className="card-title mb-6">Contact Information</h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-muted-foreground">First Name</p>
                <p>{client.firstName}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Last Name</p>
                <p>{client.lastName}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p>{client.contactEmail}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Mobile</p>
                <p>{client.contactMobileNumber}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Office Number</p>
                <p>{client.contactOfficeNumber}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Designation</p>
                <p>{client.contactDesignation}</p>
              </div>

            </div>
          </CardBox>

        </div>

        {/* 🔹 Billing Full Width */}
        <CardBox className="p-6">
          <h5 className="card-title mb-6">Billing Information</h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <p className="text-xs text-muted-foreground">Billing Name</p>
              <p>{client.billingName}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Billing Email</p>
              <p>{client.billingEmail}</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Billing Address</p>
              <p>{client.billingAddress}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Billing Terms</p>
              <p>{client.billingTerms}</p>
            </div>

          </div>
        </CardBox>

      </div>
    </>
  );
};

export default ClientDetails;
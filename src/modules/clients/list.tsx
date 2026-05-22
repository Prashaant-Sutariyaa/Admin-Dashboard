import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';

import ClientTable from './components/table';
import ClientDialog from './components/dialogForm';

import { clientService, Client } from './services/clientService';

import { useConfirm } from 'src/components/shared/confirmdialog/confirm-context';
import { toast } from 'sonner';
import Can from 'src/permissions/CanPermission';

const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const confirm = useConfirm();

  // ✅ Load all data
  const loadAll = async () => {
    const [clientData] = await Promise.all([
      clientService.getClients(),
    ]);

    setClients(clientData);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ✅ Create
  const openCreate = () => {
    setDialogMode('create');
    setSelectedClient(null);
    setDialogOpen(true);
  };

  // ✅ Edit
  const openEdit = async (client: Client) => {
    const fullClient = await clientService.getClientById(client.id);

    setDialogMode('edit');
    setSelectedClient(fullClient);
    setDialogOpen(true);
  };

  // ✅ Delete
  const handleDelete = async (client: Client) => {
    const ok = await confirm({
      title: 'Delete client?',
      description:
        'Are you sure you want to remove this client? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    });

    if (!ok) return;

    await clientService.deleteClient(client.id);
    toast.success('Client deleted');

    loadAll();
  };

  const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Clients' },
  ];

  return (
    <>
      <SlimBreadcrumb title="Clients" items={BCrumb} />

      <CardBox>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h5 className="card-title">Clients List</h5>
          <Can module="client" actions={['create']}>
            <Button variant="lightprimary" onClick={openCreate}>
              <Icon icon="solar:add-circle-linear" width={18} height={18} />
              Create Client
            </Button>
          </Can>
        </div>

        {/* Table */}
        <ClientTable
          clients={clients}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </CardBox>

      {/* Dialog */}
      <ClientDialog
        key={selectedClient?.id ?? 'create'}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          loadAll();
        }}
        mode={dialogMode}
        client={selectedClient || undefined}
      />
    </>
  );
};

export default ClientList;
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';

import VendorTable from './components/table';
import VendorDialog from './components/dialogForm';

import { vendorService, Vendor } from './services/vendorService';
import { useConfirm } from 'src/components/shared/confirmdialog/confirm-context';
import { toast } from 'sonner';
import Can from 'src/permissions/CanPermission';

const VendorList = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const confirm = useConfirm();

  const loadAll = async () => {
    const [vendorData] = await Promise.all([
      vendorService.getVendors(),
    ]);

    setVendors(vendorData);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreate = () => {
    setDialogMode('create');
    setSelectedVendor(null);
    setDialogOpen(true);
  };

  const openEdit = async (vendor: Vendor) => {
    const fullVendor = await vendorService.getVendorById(vendor.id);
    setDialogMode('edit');
    setSelectedVendor(fullVendor);
    setDialogOpen(true);
  };

  const handleDelete = async (vendor: Vendor) => {
    const ok = await confirm({
      title: 'Delete vendor?',
      description: 'Are you sure you want to remove this vendor?',
      confirmText: 'Delete',
      variant: 'destructive',
    });

    if (!ok) return;

    await vendorService.deleteVendor(vendor.id);
    toast.success('Vendor deleted');
    loadAll();
  };

  return (
    <>
      <SlimBreadcrumb title="Vendors" items={[{ title: 'Vendors' }]} />

      <CardBox>
        <div className="flex items-center justify-between mb-4">
          <h5 className="card-title">Vendors List</h5>
          <Can module="vendor" actions={['create']}>
            <Button variant="lightprimary" onClick={openCreate}>
              <Icon icon="solar:add-circle-linear" width={18} height={18} />
              Create Vendor
            </Button>
          </Can>
        </div>

        <VendorTable
          vendors={vendors}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </CardBox>

      <VendorDialog
        key={selectedVendor?.id ?? 'create'}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          loadAll();
        }}
        mode={dialogMode}
        vendor={selectedVendor || undefined}
      />
    </>
  );
};

export default VendorList;
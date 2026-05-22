import { useEffect, useState } from 'react';

import CardBox from 'src/components/shared/CardBox';
import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from 'src/components/ui/dialog';

import { Button } from 'src/components/ui/button';

import SharedPagination from 'src/components/shared/pagination/SharedPagination';

import { modulePermissionService } from './services/modulePermissionService';

import ModulePermissionsTable from './components/table';
import ModulePermissionForm from './components/form';
import ModulePermissionFilters from './components/filter';

import { userService } from 'src/modules/users/services/userService';

import { useConfirm } from 'src/components/shared/confirmdialog/confirm-context';

import { toast } from 'sonner';

import { Icon } from '@iconify/react';

import Can from 'src/permissions/CanPermission';

const ModulePermissionsList = () => {

  const [data, setData] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  // ✅ pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // ✅ search
  const [search, setSearch] = useState('');

  // ✅ dialog
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<any>(null);

  const confirm = useConfirm();

  // ✅ fetch
  const loadAll = async () => {
    try {
      setLoading(true);

      const [mp, users] = await Promise.all([
        modulePermissionService.getAllModulePermissions({
          page,
          limit,
          search: search || undefined,
        }),

        userService.getAllUsersList(),
      ]);

      setData(mp.data);
      setTotal(mp.total);

      setUsers(users);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [page, limit, search]);

  // ✅ helpers
  const getUser = (id?: number) => {
    if (!id) return null;
    return users.find((u) => u.id === id) || null;
  };

  const mapped = data.map((d) => {
    const updatedUser = getUser(d.updatedBy);

    return {
      ...d,

      updatedByName: updatedUser
        ? `${updatedUser.firstName} ${updatedUser.lastName}`
        : '—',

      updatedByEmail: updatedUser?.email || '—',
    };
  });

  // ✅ delete
  const handleDelete = async (row: any) => {

    const ok = await confirm({
      title: 'Delete permission?',
      description:
        'Deleting this module permission may affect user access across the system. This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    });

    if (!ok) return;

    await modulePermissionService.delete(row.id);

    toast.success('Deleted');

    loadAll();
  };
  const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Module Permissions' },
  ];

  return (
    <>
      <SlimBreadcrumb
        title="Permissions"
        items={BCrumb}
      />

      <CardBox>

        {/* TOP */}
        <div className="flex justify-between gap-4 mb-4">

          <ModulePermissionFilters
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />

          <Can module="module-permissions" actions={['create']}>
            <Button
              variant="lightprimary"
              onClick={() => {
                setMode('create');
                setOpen(true);
              }}
            >
              <Icon
                icon="solar:add-circle-linear"
                width={18}
              />
              Create Permission
            </Button>
          </Can>

        </div>

        {/* TABLE */}
        <ModulePermissionsTable
          data={mapped}
          loading={loading}
          onEdit={(row) => {
            setSelected(row);
            setMode('edit');
            setOpen(true);
          }}
          onDelete={handleDelete}
        />

        {/* PAGINATION */}
        <SharedPagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />

      </CardBox>

      {/* DIALOG */}
      <Dialog
        open={open}
        onOpenChange={(v) => !v && setOpen(false)}
      >
        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              {mode === 'create'
                ? 'Create Permission'
                : 'Edit Permission'}
            </DialogTitle>
          </DialogHeader>

          <ModulePermissionForm
            mode={mode}
            initialData={selected}
            onSuccess={() => {
              setOpen(false);
              loadAll();
            }}
          />

        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModulePermissionsList;
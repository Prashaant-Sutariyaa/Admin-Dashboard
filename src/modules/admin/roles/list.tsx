import { useEffect, useState } from 'react';
import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';
import CardBox from 'src/components/shared/CardBox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';

import RolesTable from './components/table';
import RoleForm from './components/form';
import { rolesService, Role } from './services/rolesService';
import { userService } from 'src/modules/users/services/userService';

import { useConfirm } from 'src/components/shared/confirmdialog/confirm-context';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import Can from 'src/permissions/CanPermission';
import { Button } from 'src/components/ui/button';

const RolesList = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Role | null>(null);

  const confirm = useConfirm();

  const loadAll = async () => {
    const [rolesData, usersData] = await Promise.all([
      rolesService.getRoles(),
      userService.getAllUsersList(),
    ]);

    setRoles(rolesData);
    setUsers(usersData);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Roles' },
  ];

const getUser = (id?: number) => {
  if (!id) return null;
  return users.find((u) => u.id === id) || null;
};

const mappedRoles = roles.map((role) => {
  const updatedUser = getUser(role.updatedBy);

  return {
    ...role,
    updatedByName: updatedUser
      ? `${updatedUser.firstName} ${updatedUser.lastName}`
      : '—',
    updatedByEmail: updatedUser?.email || '—',
  };
});

  const openCreate = () => {
    setMode('create');
    setSelected(null);
    setOpen(true);
  };

  const openEdit = (role: Role) => {
    setMode('edit');
    setSelected(role);
    setOpen(true);
  };

  const handleDelete = async (role: Role) => {
    const ok = await confirm({
      title: 'Delete role?',
      description: 'Are you sure you want to delete this role? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    });

    if (!ok) return;

    await rolesService.deleteRole(role.id);
    toast.success('Role deleted');
    loadAll();
  };

  return (
    <>
      <SlimBreadcrumb title="Roles" items={BCrumb} />

      <CardBox>
        <div className="flex items-center justify-between mb-4">
          <h5 className="card-title">Roles List</h5>
          <Can module="roles" actions={['create']}>

            <Button variant="lightprimary"
              onClick={openCreate}
            >
              <Icon icon="solar:add-circle-linear" width={18} />
              Create Role
            </Button>
          </Can>
        </div>

        <RolesTable
          roles={mappedRoles}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </CardBox>

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Role' : 'Edit Role'}
            </DialogTitle>
          </DialogHeader>

          <RoleForm
            mode={mode}
            initialData={selected || undefined}
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

export default RolesList;
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';
import CardBox from 'src/components/shared/CardBox';

import UsersTable from './components/table';
import UserFormDialog from './components/UserFormDialog';
import ChangePasswordDialog from './components/passwordDialog';
import UserPermissionDialog from './components/UserPermissionDialog';

import { useConfirm } from 'src/components/shared/confirmdialog/confirm-context';
import { toast } from 'sonner';

import { userService, User } from './services/userService';
import { rolesService, Role } from 'src/modules/admin/roles/services/rolesService';
import {
  departmentService,
  Department,
} from 'src/modules/admin/departments/services/departmentService';
import Can from 'src/permissions/CanPermission';
import { Button } from 'src/components/ui/button';

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  const confirm = useConfirm();

  // ✅ Load all data
  const loadAll = async () => {
    const [usersData, rolesData, deptData] = await Promise.all([
      userService.getUsers(),
      rolesService.getAllRolesList(),
      departmentService.getAllDepartmentsList(),
    ]);

    setUsers(usersData);
    setRoles(rolesData);
    setDepartments(deptData);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ✅ Create
  const openCreate = () => {
    setDialogMode('create');
    setSelectedUser(null);
    setDialogOpen(true);
  };

  // ✅ Edit (fetch full user)
  const openEdit = async (user: User) => {
    const fullUser = await userService.getUserById(user.id);

    setDialogMode('edit');
    setSelectedUser(fullUser);
    setDialogOpen(true);
  };

  // ✅ Delete (soft delete backend)
  const handleDelete = async (user: User) => {
    const ok = await confirm({
      title: 'Delete user?',
      description: 'Are you sure you want to remove this user? This action cannot be undone..',
      confirmText: 'Delete',
      variant: 'destructive',
    });

    if (!ok) return;

    await userService.deleteUser(user.id);
    toast.success('User deleted');

    loadAll();
  };

  // ✅ Password
  const handleChangePassword = (user: User) => {
    setActiveUser(user);
    setPasswordOpen(true);
  };

  // ✅ Permission
  const handlePermission = (user: User) => {
    setActiveUser(user);
    setPermissionOpen(true);
  };

  const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'Users' },
  ];

  return (
    <>
      <SlimBreadcrumb title="Users" items={BCrumb} />

      <CardBox>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h5 className="card-title">Users List</h5>
          <Can module="users" actions={['create']}>
            <Button variant="lightprimary" onClick={openCreate}>
              <Icon icon="solar:add-circle-linear" width={18} height={18} />
              Create User
            </Button>
          </Can>

        </div>

        {/* Table */}
        <UsersTable
          users={users}
          roles={roles}
          departments={departments}
          onEdit={openEdit}
          onDelete={handleDelete}
          onChangePassword={handleChangePassword}
          onPermission={handlePermission}
        />

      </CardBox>

      {/* Create/Edit Dialog */}
      <UserFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          loadAll();
        }}
        mode={dialogMode}
        user={selectedUser || undefined}
      />

      {/* Password Dialog */}
      <ChangePasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        userId={activeUser?.id}
      />

      {/* Permission Dialog (separate component ) */}
      <UserPermissionDialog
        open={permissionOpen}
        onClose={() => setPermissionOpen(false)}
        userId={activeUser?.id}
      />
    </>
  );
};

export default UsersList;
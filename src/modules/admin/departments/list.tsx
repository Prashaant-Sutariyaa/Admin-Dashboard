import { useEffect, useState } from 'react';
import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';
import CardBox from 'src/components/shared/CardBox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from 'src/components/ui/dialog';

import DepartmentsTable from './components/table';
import DepartmentForm from './components/form';
import { departmentService, Department } from './services/departmentService';
import { userService } from 'src/modules/users/services/userService';

import { useConfirm } from 'src/components/shared/confirmdialog/confirm-context';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import Can from 'src/permissions/CanPermission';
import { Button } from 'src/components/ui/button';

const DepartmentsList = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Department | null>(null);

  const confirm = useConfirm();

  const loadAll = async () => {
    const [deptData, usersData] = await Promise.all([
      departmentService.getDepartments(),
      userService.getAllUsersList(),
    ]);

    setDepartments(deptData);
    setUsers(usersData);
  };

  useEffect(() => {
    loadAll();
  }, []);

const getUser = (id?: number) => {
  if (!id) return null;
  return users.find((u) => u.id === id) || null;
};

const mappedDepartments = departments.map((d) => {
  const user = getUser(d.updatedBy);

  return {
    ...d,
    updatedByName: user
      ? `${user.firstName} ${user.lastName}`
      : '—',
    updatedByEmail: user?.email || '—',
  };
});

  const openCreate = () => {
    setMode('create');
    setSelected(null);
    setOpen(true);
  };

  const openEdit = (d: Department) => {
    setMode('edit');
    setSelected(d);
    setOpen(true);
  };

  const handleDelete = async (d: Department) => {
    const ok = await confirm({
      title: 'Delete department?',
      description: 'Are you sure you want to delete this department? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
    });

    if (!ok) return;

    await departmentService.deleteDepartment(d.id);
    toast.success('Department deleted');
    loadAll();
  };

  return (
    <>
      <SlimBreadcrumb title="Departments" items={[{ to: '/', title: 'Home' }, { title: 'Departments' }]} />

      <CardBox>
        <div className="flex items-center justify-between mb-4">
          <h5 className="card-title">Departments List</h5>

          <Can module="department" actions={['create']}>
            <Button variant="lightprimary"
              onClick={openCreate}
            >
              <Icon icon="solar:add-circle-linear" width={18} />
              Create Department
            </Button>

          </Can>
        </div>

        <DepartmentsTable
          departments={mappedDepartments}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </CardBox>

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Department' : 'Edit Department'}
            </DialogTitle>
          </DialogHeader>

          <DepartmentForm
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

export default DepartmentsList;
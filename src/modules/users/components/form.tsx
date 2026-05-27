import { useEffect, useState } from 'react';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import { toast } from 'sonner';

import { rolesService, Role } from 'src/modules/admin/roles/services/rolesService';
import { departmentService, Department } from 'src/modules/admin/departments/services/departmentService';
import { userService } from '../services/userService';

interface Props {
  mode: 'create' | 'edit';
  initialData?: any;
  onSuccess: () => void;
}

const UserForm = ({ mode, initialData, onSuccess }: Props) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile_number: '',
    job_title: '',
    work_location: '',
    role_id: '',
    department_id: '',
    is_active: true,
  });

  // ✅ Load dropdown data
  useEffect(() => {
    const load = async () => {
      const [r, d] = await Promise.all([
        rolesService.getActiveRolesList(),
        departmentService.getActiveDepartmentsList(),
      ]);
      setRoles(r);
      setDepartments(d);
    };
    load();
  }, []);

  // ✅ Prefill (FIXED PROPERLY)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        first_name: initialData.firstName || '',
        last_name: initialData.lastName || '',
        email: initialData.email || '',
        password: '',
        confirmPassword: '',
        mobile_number: initialData.mobileNumber || '',
        job_title: initialData.jobTitle || '',
        work_location: initialData.workLocation || '',
        role_id: String(initialData.roleId || ''),            // ✅ important
        department_id: String(initialData.departmentId || ''),// ✅ important
        is_active: initialData.isActive ?? true,
      });
    }
  }, [mode, initialData]);

  // ✅ Re-sync role_id and department_id AFTER dropdowns load
  useEffect(() => {
    if (mode === 'edit' && initialData && roles.length > 0 && departments.length > 0) {
      setForm((prev) => ({
        ...prev,
        role_id: String(initialData.roleId || ''),
        department_id: String(initialData.departmentId || ''),
      }));
    }
  }, [roles, departments]); // 👈 fires again once dropdowns are populated

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ✅ diff logic
  const getChangedFields = (original: any, current: any) => {
    const diff: any = {};

    Object.keys(current).forEach((key) => {
      if (current[key] !== original[key]) {
        diff[key] = current[key];
      }
    });

    return diff;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ basic validation
    if (!form.role_id || !form.department_id) {
      toast.error('Role & Department required');
      return;
    }

    if (mode === 'create') {
      if (!form.email || !form.password || !form.confirmPassword) {
        toast.error('Required fields missing');
        return;
      }

      if (form.password !== form.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    let payload: any = {
      first_name: form.first_name,
      last_name: form.last_name,
      mobile_number: form.mobile_number,
      job_title: form.job_title,
      work_location: form.work_location,
      role_id: Number(form.role_id),
      department_id: Number(form.department_id),
      is_active: form.is_active,
    };

    try {
      if (mode === 'create') {
        payload.email = form.email;
        payload.password = form.password;

        await userService.createUser(payload);
        toast.success('User created');
      } else {
        // ✅ build original object
        const original = {
          first_name: initialData.firstName,
          last_name: initialData.lastName,
          mobile_number: initialData.mobileNumber,
          job_title: initialData.jobTitle,
          work_location: initialData.workLocation,
          role_id: initialData.roleId,
          department_id: initialData.departmentId,
          is_active: initialData.isActive,
        };

        payload = getChangedFields(original, payload);

        if (form.password) {
          payload.password = form.password;
        }

        if (Object.keys(payload).length === 0) {
          toast.info('No changes detected');
          return;
        }

        await userService.updateUser(initialData.id, payload);
        toast.success('User updated');
      }

      onSuccess();

    } catch (e: any) {
      const status = e?.response?.status;
      const message = e?.response?.data?.detail;

      if (status === 409) {
        toast.error(message);
        return;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Email */}
        <div>
          <Label>First Name</Label>
          <Input
            type='text'
            value={form.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            type='text'
            value={form.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input
            value={form.email}
            disabled={mode === 'edit'} // ✅ locked in edit
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        {/* Password */}
        {mode === 'create' && (
          <>
            <div>
              <Label>Password *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
            </div>

            <div>
              <Label>Confirm Password *</Label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
              />
            </div>
          </>
        )}

        {/* Mobile */}
        <div>
          <Label>Mobile</Label>
          <Input
            value={form.mobile_number}
            onChange={(e) => handleChange('mobile_number', e.target.value)}
          />
        </div>

        {/* Job */}
        <div>
          <Label>Job Title</Label>
          <Input
            value={form.job_title}
            onChange={(e) => handleChange('job_title', e.target.value)}
          />
        </div>

        {/* Location */}
        <div>
          <Label>Work Location</Label>
          <Input
            value={form.work_location}
            onChange={(e) => handleChange('work_location', e.target.value)}
          />
        </div>

        {/* Role */}
        <div>
          <Label>Role *</Label>
          <Select
            value={form.role_id}
            onValueChange={(v) => handleChange('role_id', v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.filter((r) => r.name !== 'CEO').map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department */}
        <div>
          <Label>Department *</Label>
          <Select
            value={form.department_id}
            onValueChange={(v) => handleChange('department_id', v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
          />
          <span className="text-sm">Active User</span>
        </div>

      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="lighterror" type="button" onClick={onSuccess}>
          Cancel
        </Button>
        <Button variant="lightprimary" type="submit">
          {mode === 'create' ? 'Create' : 'Update'}
        </Button>
      </div>

    </form>
  );
};

export default UserForm;
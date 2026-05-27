import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';

import { Button } from 'src/components/ui/button';
import { Pencil, Trash2, Key, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';

import { User } from '../services/userService';
import { Role } from 'src/modules/admin/roles/services/rolesService';
import { Department } from 'src/modules/admin/departments/services/departmentService';
import StatusBadge from 'src/components/shared/status-badges/StatusBadge';
import { capitalizeFirst } from 'src/utils/format';
import Can from 'src/permissions/CanPermission';

interface Props {
  users: User[];
  roles: Role[];
  departments: Department[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onChangePassword: (user: User) => void;
  onPermission: (user: User) => void;
}

const UsersTable = ({
  users,
  roles,
  departments,
  onEdit,
  onDelete,
  onChangePassword,
  onPermission,
}: Props) => {
  const navigate = useNavigate();

  // ✅ Role name
  const getRoleName = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? capitalizeFirst(role.name) : 'N/A';
  };

  // ✅ Department name (single)
  const getDepartmentName = (id: number) => {
    const dept = departments.find((d) => d.id === id);
    return dept ? capitalizeFirst(dept.name) : 'N/A';
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-x-auto border border-border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">User ID</TableHead>
              <TableHead className="text-center">First Name</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Job Title</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Department</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Password</TableHead>
              <Can module="users" actions={['edit', 'delete', 'permissions']}>
                <TableHead className="text-center">Actions</TableHead>
              </Can>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="even:bg-lightprimary/80 cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/users/details/${user.id}`)}
                >
                  {/* ID */}
                  <TableCell className="text-center">
                    {user.id}
                  </TableCell>

                  {/* First Name */}
                  <TableCell className="text-center">
                    {capitalizeFirst(user.firstName)}
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-center">
                    {user.email}
                  </TableCell>

                  {/* Job */}
                  <TableCell className="text-center">
                    {capitalizeFirst(user.jobTitle)}
                  </TableCell>

                  {/* Role */}
                  <TableCell className="text-center">
                    {getRoleName(user.roleId)}
                  </TableCell>

                  {/* Department */}
                  <TableCell className="text-center">
                    {getDepartmentName(user.departmentId)}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center">
                    <StatusBadge
                      value={user.isActive ? 'Active' : 'Inactive'}
                    />
                  </TableCell>

                  {/* Password */}
                  <TableCell
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onChangePassword(user)}
                        >
                          <Key className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Change Password</TooltipContent>
                    </Tooltip>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()} >
                    <div className="flex justify-center gap-2">
                      {/* Permissions */}
                      <Can module="users" action='permissions'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onPermission(user)}
                            >
                              <ShieldCheck className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Manage Permissions</TooltipContent>
                        </Tooltip>
                      </Can>
                      <Can module="users" action="edit">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="lightprimary"
                              onClick={() => onEdit(user)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </Can>

                      <Can module="users" action="delete">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="lighterror"
                              onClick={() => onDelete(user)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                      </Can>


                    </div>
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default UsersTable;
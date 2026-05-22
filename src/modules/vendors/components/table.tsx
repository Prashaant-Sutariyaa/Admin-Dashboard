import { useEffect, useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';

import { Button } from 'src/components/ui/button';
import { Pencil, Trash2, Download } from 'lucide-react';
import { useNavigate } from 'react-router';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';

import { Vendor, vendorService } from '../services/vendorService';
import { userService, User } from 'src/modules/users/services/userService';

import { capitalizeFirst } from 'src/utils/format';
import StatusBadge from 'src/components/shared/status-badges/StatusBadge';
import Can from 'src/permissions/CanPermission';

interface Props {
  vendors: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
}

const VendorTable = ({
  vendors,
  onEdit,
  onDelete,
}: Props) => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);

  // ✅ Load users inside table
  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsersList();
      setUsers(data || []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getAssignedUserEmail = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.email : 'N/A';
  };

  const handleDownload = async (id: number) => {
    await vendorService.downloadContract(id);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-x-auto border border-border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Code</TableHead>
              <TableHead className="text-center">Vendor Name</TableHead>
              <TableHead className="text-center">Person</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Number</TableHead>
              <TableHead className="text-center">Assigned To</TableHead>
              <TableHead className="text-center">Status</TableHead>

              <Can module="vendor" actions={['edit', 'delete', 'download']}>
                <TableHead className="text-center">Actions</TableHead>
              </Can>
            </TableRow>
          </TableHeader>

          <TableBody>
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No vendors found.
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow
                  key={vendor.id}
                  className="even:bg-lightprimary/80 cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/vendors/details/${vendor.id}`)}
                >
                  <TableCell className="text-center font-semibold text-primary">
                    {vendor.code}
                  </TableCell>

                  <TableCell className="text-center">
                    {capitalizeFirst(vendor.name)}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="h-8 w-8 rounded-full bg-lightprimary text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {vendor.firstName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-foreground whitespace-nowrap">
                        {vendor.firstName} {vendor.lastName}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {vendor.contactEmail}
                  </TableCell>

                  <TableCell className="text-center">
                    {vendor.contactMobileNumber}
                  </TableCell>

                  <TableCell className="text-center">
                    {getAssignedUserEmail(vendor.assignedTo)}
                  </TableCell>

                  <TableCell className="text-center">
                    <StatusBadge value={vendor.isActive ? 'Active' : 'Inactive'} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center gap-2">

                      {/* Download */}
                      <Can module="vendor" action="download">
                        {vendor.contractFileName ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="lightinfo"
                                onClick={() => handleDownload(vendor.id)}
                              >
                                <Download className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {vendor.contractFileName}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </Can>

                      {/* Edit */}
                      <Can module="vendor" action="edit">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="lightprimary"
                              onClick={() => onEdit(vendor)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </Can>

                      {/* Delete */}
                      <Can module="vendor" action="delete">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="lighterror"
                              onClick={() => onDelete(vendor)}
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

export default VendorTable;
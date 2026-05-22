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

import { Client, clientService } from '../services/clientService';
import { userService, User } from 'src/modules/users/services/userService';

import { capitalizeFirst } from 'src/utils/format';
import StatusBadge from 'src/components/shared/status-badges/StatusBadge';
import Can from 'src/permissions/CanPermission';

interface Props {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

const ClientTable = ({
  clients,
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
    await clientService.downloadContract(id);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-x-auto border border-border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Code</TableHead>
              <TableHead className="text-center">Client Name</TableHead>
              <TableHead className="text-center">Person</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Number</TableHead>
              <TableHead className="text-center">Assigned To</TableHead>
              <TableHead className="text-center">Status</TableHead>

              <Can module="client" actions={['edit', 'delete', 'download']}>
                <TableHead className="text-center">Actions</TableHead>
              </Can>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow
                  key={client.id}
                  className="even:bg-lightprimary/80 cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/clients/details/${client.id}`)}
                >
                  <TableCell className="text-center font-semibold text-primary">
                    {client.code}
                  </TableCell>

                  <TableCell className="text-left">
                    {capitalizeFirst(client.name)}
                  </TableCell>

                  <TableCell className="text-left">
                    <div className="flex items-center gap-2 justify-start">
                      <div className="h-8 w-8 rounded-full bg-lightprimary text-primary flex items-center justify-center text-xs font-bold shrink-0">
                        {client.firstName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-foreground whitespace-nowrap">
                        {client.firstName} {client.lastName}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {client.contactEmail}
                  </TableCell>

                  <TableCell className="text-center">
                    {client.contactMobileNumber}
                  </TableCell>

                  <TableCell className="text-center">
                    {getAssignedUserEmail(client.assignedTo)}
                  </TableCell>

                  <TableCell className="text-center">
                    <StatusBadge value={client.isActive ? 'Active' : 'Inactive'} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    className="text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center gap-2">

                      {/* Download */}
                      <Can module="client" action="download">
                        {client.contractFileName ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="lightinfo"
                                onClick={() => handleDownload(client.id)}
                              >
                                <Download className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {client.contractFileName}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </Can>

                      {/* Edit */}
                      <Can module="client" action="edit">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="lightprimary"
                              onClick={() => onEdit(client)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>
                      </Can>

                      {/* Delete */}
                      <Can module="client" action="delete">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="lighterror"
                              onClick={() => onDelete(client)}
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

export default ClientTable;
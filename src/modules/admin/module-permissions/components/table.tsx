import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from 'src/components/ui/table';
import { Button } from 'src/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import StatusBadge from 'src/components/shared/status-badges/StatusBadge';
import { capitalizeFirst } from 'src/utils/format';
import Can from 'src/permissions/CanPermission';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/components/ui/tooltip';

interface Props {
  data: any[];
  loading: boolean;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
}

const ModulePermissionsTable = ({
  data,
  loading,
  onEdit,
  onDelete,
}: Props) => {
  return (
    <div className="overflow-x-auto border border-border rounded-md">
      <Table className='overflow-x-auto'>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Menu</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Permission</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated By</TableHead>
            <TableHead>Updated At</TableHead>
            <Can module="module-permissions" actions={['edit', 'delete']}>
              <TableHead>Actions</TableHead>
            </Can>
          </TableRow>
        </TableHeader>

        <TableBody>

          {loading ? (
            <TableRow>
              <TableCell
                colSpan={11}
                className="text-center text-muted-foreground py-6"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={11}
                className="text-center text-muted-foreground py-6"
              >
                No module permissions found
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id} className="even:bg-lightprimary/80">

                <TableCell>{row.id}</TableCell>
                <TableCell>{capitalizeFirst(row.menuName)}</TableCell>
                <TableCell>{capitalizeFirst(row.moduleName)}</TableCell>
                <TableCell>{capitalizeFirst(row.permissionName)}</TableCell>

                <TableCell>
                  <StatusBadge value={row.isActive ? 'Active' : 'Inactive'} />
                </TableCell>

                <TableCell>
                  {row.updatedByName !== '—' ? (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-pointer">
                            {row.updatedByName}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {row.updatedByEmail}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell>{row.updatedAt || '—'}</TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Can module="module-permissions" actions={['edit']}>
                      <Button size="sm" variant="lightprimary" onClick={() => onEdit(row)}>
                        <Pencil size={16} />
                      </Button>
                    </Can>
                    <Can module="module-permissions" actions={['delete']}>
                      <Button size="sm" variant="lighterror" onClick={() => onDelete(row)}>
                        <Trash2 size={16} />
                      </Button>
                    </Can>
                  </div>
                </TableCell>

              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ModulePermissionsTable;
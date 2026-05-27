import { useEffect, useState } from 'react';
import CardBox from 'src/components/shared/CardBox';
import SlimBreadcrumb from 'src/components/shared/breadcrumb/SlimBreadcrumb';

import { userService } from 'src/modules/users/services/userService';
import UserPermissionForm from './components/form';
import { Label } from 'src/components/ui/label';
import AutoComplete from "src/components/ui/AutoComplete";

const UserPermissionList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const res = await userService.getAllActiveUsersList();
      setUsers(res);
    };

    load();
  }, []);

  const selectedUser = users.find((u) => u.id === userId);

  const BCrumb = [
    { to: '/', title: 'Home' },
    { title: 'User Permissions' },
  ];

  return (
    <>
      <SlimBreadcrumb title="User Permissions" items={BCrumb} />

      <CardBox>

        {/* Select */}
        <div>
          <Label>User</Label>

          <AutoComplete
            value={userId ? String(userId) : ''}
            onChange={(value) =>
              setUserId(
                value ? Number(value) : null
              )
            }
            placeholder="Select User"
            options={users.map((u) => ({
              label: u.email,
              value: String(u.id),
            }))}
          />
        </div>

        {/* Context */}
        <div className="mt-1 mb-1">

          {!userId ? (
            <p className="text-sm text-muted-foreground">
              Please select a user to manage permissions
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">

              <div className="text-sm text-muted-foreground">
                Managing permissions for{' '}
                <span className="font-medium text-foreground">
                  {selectedUser?.email}
                </span>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-lightprimary/20 text-primary font-medium whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {activeCount} active permissions
              </div>

            </div>
          )}

        </div>

        {/* Form */}
        {userId && (
          <UserPermissionForm
            userId={userId}
            setActiveCount={setActiveCount}
          />
        )}

      </CardBox>
    </>
  );
};

export default UserPermissionList;
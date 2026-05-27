import { useEffect, useState } from "react";
import { useParams } from "react-router";

import SlimBreadcrumb from "src/components/shared/breadcrumb/SlimBreadcrumb";
import CardBox from "src/components/shared/CardBox";
import profileImg from "src/assets/images/profile/user-1.jpg";

import { userService } from "./services/userService";
import { rolesService } from "src/modules/admin/roles/services/rolesService";
import { departmentService } from "src/modules/admin/departments/services/departmentService";

import StatusBadge from "src/components/shared/status-badges/StatusBadge";
import { capitalizeFirst } from "src/utils/format";

const UserDetails = () => {
  const { id } = useParams();

  const [user, setUser] = useState<any>(null);
  const [roleName, setRoleName] = useState<string>("N/A");
  const [departmentName, setDepartmentName] = useState<string>("N/A");
  const [loading, setLoading] = useState(true);

  const BCrumb = [
    { to: "/", title: "Home" },
    { title: "User Details" },
  ];

  const loadData = async () => {
    if (!id) return;

    try {
      const [userData, roles, departments] = await Promise.all([
        userService.getUserById(Number(id)),
        rolesService.getAllRolesList(),
        departmentService.getAllDepartmentsList(),
      ]);

      setUser(userData);

      const role = roles.find((r) => r.id === userData.roleId);
      setRoleName(role ? capitalizeFirst(role.name) : "N/A");

      const dept = departments.find((d) => d.id === userData.departmentId);
      setDepartmentName(dept ? capitalizeFirst(dept.name) : "N/A");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!user) {
    return <p className="text-muted-foreground">User not found</p>;
  }
  return (
    <>
      <SlimBreadcrumb title="User Details" items={BCrumb} />

      <div className="flex flex-col gap-6">

        {/* HEADER */}
        <CardBox className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">

            <img
              src={profileImg}
              alt="profile"
              className="w-20 h-20 rounded-full"
            />

            <div className="flex flex-col text-center sm:text-left gap-1">
              <h5 className="card-title">{user.email}</h5>

              <p className="text-sm text-muted-foreground">
                {capitalizeFirst(user.jobTitle)} • {user.workLocation || "N/A"}
              </p>

              <p className="text-xs text-muted-foreground">
                Role: {roleName} • Department: {departmentName}
              </p>
            </div>

            <div className="ml-auto">
              <StatusBadge value={user.isActive ? "Active" : "Inactive"} />
            </div>

          </div>
        </CardBox>

        {/* DETAILS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* PERSONAL */}
          <CardBox className="p-6">
            <h5 className="card-title mb-4">Personal Information</h5>

            <div className="grid grid-cols-2 gap-4 text-sm">

              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p>{user.email}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Mobile</p>
                <p>{user.mobileNumber || "N/A"}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Role</p>
                <p>{roleName}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Department</p>
                <p>{departmentName}</p>
              </div>

            </div>
          </CardBox>

          {/* WORK */}
          <CardBox className="p-6">
            <h5 className="card-title mb-4">Work Information</h5>

            <div className="grid grid-cols-2 gap-4 text-sm">

              <div>
                <p className="text-muted-foreground text-xs">Job Title</p>
                <p>{capitalizeFirst(user.jobTitle)}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Location</p>
                <p>{user.workLocation || "N/A"}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Created At</p>
                <p>{user.createdAt}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Updated At</p>
                <p>{user.updatedAt}</p>
              </div>

            </div>
          </CardBox>

        </div>

      </div>
    </>
  );
};

export default UserDetails;
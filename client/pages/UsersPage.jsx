import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../components/DataTable.jsx";
import { userService } from "../services/userService.js";

export const UsersPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["users", 1],
    queryFn: () => userService.list(1)
  });

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "assignedProjects",
      label: "Assigned Projects",
      render: (row) => row.assignedProjects.map((project) => project.code).join(", ") || "None"
    }
  ];

  if (isLoading) {
    return <div className="panel">Loading users...</div>;
  }

  return (
    <section className="space-y-4">
      <div className="panel">
        <h3 className="text-xl font-semibold">User management</h3>
        <p className="mt-2 text-sm text-slate-500">Survey agents and admins with project assignment visibility.</p>
      </div>
      <DataTable columns={columns} rows={data.items} />
    </section>
  );
};


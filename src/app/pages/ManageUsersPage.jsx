import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import AlertBanner from "../components/AlertBanner";
import DataTable from "../components/DataTable";
import PageIntro from "../components/PageIntro";
import { managedUsers } from "../data/users";

function ManageUsersPage() {
  return (
    <div className="container">
      <PageIntro
        eyebrow="Manage users"
        title="Review learner and admin accounts across your platform."
        description="User administration is shown through a compact table with status, plan, and workshop activity."
      />

      <AlertBanner
        title="4 invites pending confirmation"
        description="A lightweight admin alert keeps the page feeling active and operational."
        action={
          <button className="button button-secondary" type="button" onClick={() => toast.success("Invite modal could open here.")}>
            <UserPlus size={16} />
            Invite user
          </button>
        }
      />

      <div className="data-card" style={{ marginTop: "1rem" }}>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "role", label: "Role" },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <span
                  className={`status-badge ${
                    row.status === "Active"
                      ? "status-success"
                      : row.status === "Pending"
                        ? "status-warning"
                        : "status-neutral"
                  }`}
                >
                  {row.status}
                </span>
              ),
            },
            { key: "plan", label: "Plan" },
            { key: "workshops", label: "Workshops" },
          ]}
          rows={managedUsers}
        />
      </div>
    </div>
  );
}

export default ManageUsersPage;

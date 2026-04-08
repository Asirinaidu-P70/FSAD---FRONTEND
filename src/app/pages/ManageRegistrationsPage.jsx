import { useState } from "react";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import PageIntro from "../components/PageIntro";

const registrationRows = [
  {
    id: "reg-1",
    learner: "Nina Patel",
    workshop: "AI Product Strategy Sprint",
    status: "Approved",
    payment: "Paid",
  },
  {
    id: "reg-2",
    learner: "Riley Brooks",
    workshop: "Design Systems for Fast Teams",
    status: "Pending",
    payment: "Awaiting",
  },
  {
    id: "reg-3",
    learner: "Priya Menon",
    workshop: "Remote Facilitation Studio",
    status: "Waitlisted",
    payment: "Paid",
  },
];

function ManageRegistrationsPage() {
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  return (
    <div className="container">
      <PageIntro
        eyebrow="Registrations"
        title="Triage approvals, waitlists, and payment state at a glance."
        description="A dedicated registrations view makes the admin experience feel more complete than a simple workshop CRUD app."
      />

      <div className="data-card">
        <DataTable
          columns={[
            { key: "learner", label: "Learner" },
            { key: "workshop", label: "Workshop" },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <span
                  className={`status-badge ${
                    row.status === "Approved"
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
            { key: "payment", label: "Payment" },
            {
              key: "actions",
              label: "Action",
              render: (row) => (
                <button type="button" className="button button-secondary" onClick={() => setSelectedRegistration(row)}>
                  Review
                </button>
              ),
            },
          ]}
          rows={registrationRows}
        />
      </div>

      <Modal
        footer={<button type="button" className="button button-primary">Approve registration</button>}
        onClose={() => setSelectedRegistration(null)}
        open={Boolean(selectedRegistration)}
        title={selectedRegistration?.learner || "Registration review"}
      >
        {selectedRegistration ? (
          <div className="page-grid">
            <div className="workshop-meta">
              <span className="muted">Workshop</span>
              <strong>{selectedRegistration.workshop}</strong>
            </div>
            <div className="workshop-meta">
              <span className="muted">Status</span>
              <strong>{selectedRegistration.status}</strong>
            </div>
            <div className="workshop-meta">
              <span className="muted">Payment</span>
              <strong>{selectedRegistration.payment}</strong>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default ManageRegistrationsPage;

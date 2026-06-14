import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";
import CreateManagerForm from "./CreateManagerForm";
import ManagerRow from "./ManagerRow";

export default async function TeamPage() {
  await requireOwner();
  const managers = await prisma.manager.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <CreateManagerForm />

      <div>
        <h2 className="mb-3 text-lg font-bold">אנשי צוות ({managers.length})</h2>
        {managers.length === 0 ? (
          <p className="text-muted">עדיין לא נוספו אנשי צוות.</p>
        ) : (
          <div className="space-y-3">
            {managers.map((m) => (
              <ManagerRow
                key={m.id}
                manager={{
                  id: m.id,
                  name: m.name,
                  username: m.username,
                  active: m.active,
                  permissions: m.permissions.split(",").filter(Boolean),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

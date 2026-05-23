import AppLayout from "../../components/layout/AppLayout"
import RoleGuard from "@/components/guards/RoleGuard"
import ChatWindow from "../../components/messages/ChatWindow"

export default function MessagesPage() {
  return (
    <RoleGuard allowedRoles={["worker", "manager", "admin", "superadmin"]}>
      <AppLayout title="Messages">
        <div style={{ margin: "-24px" }}>
          <ChatWindow />
        </div>
      </AppLayout>
    </RoleGuard>
  )
}
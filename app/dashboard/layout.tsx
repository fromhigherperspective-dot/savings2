import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "To do list - Tinigom nato",
  description: "Manage your tasks and todo list",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
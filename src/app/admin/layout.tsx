import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Panel - PowerCA",
  description: "PowerCA Admin Panel for managing bookings and users",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";

export const metadata: Metadata = {
  title: "Admin | Unique Hair Studio",
  description: "Admin dashboard for Unique Hair Studio",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}

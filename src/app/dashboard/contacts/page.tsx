import { ContactsShell } from "@/components/dashboard/contacts/contacts-shell";
import { requireUser } from "@/lib/auth/get-user";

export default async function ContactsPage() {
  await requireUser();
  return <ContactsShell />;
}

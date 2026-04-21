import type { ServiceRecord, ServiceTask } from "@/types/database";

export type BoletimHistoryRow = {
  record: ServiceRecord;
  tasks: ServiceTask[];
  invoiceHref: string | null;
  /** Signed URLs for photo attachments (antes/depois), max 2 típicos */
  photoHrefs: string[];
};

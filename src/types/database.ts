export type UserRole = "admin" | "client";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Motorcycle = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  plate: string | null;
  vin: string | null;
  notes: string | null;
  current_owner_id: string;
  created_at: string;
  updated_at: string;
};

export type ServiceRecordStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ServiceRecord = {
  id: string;
  motorcycle_id: string;
  ownership_period_id: string | null;
  status: ServiceRecordStatus;
  title: string | null;
  shop_notes: string | null;
  progress_percent: number;
  opened_at: string;
  closed_at: string | null;
};

export type ServiceTask = {
  id: string;
  service_record_id: string;
  label: string;
  sort_order: number;
  completed: boolean;
  completed_at: string | null;
};

export type AttachmentKind = "invoice" | "photo" | "other";

export type ServiceAttachment = {
  id: string;
  service_record_id: string;
  kind: AttachmentKind;
  storage_bucket: string;
  storage_path: string;
  mime_type: string | null;
  visible_to_owner_id: string | null;
  created_by: string | null;
  created_at: string;
};

export type MotorcycleOwnershipPeriod = {
  id: string;
  motorcycle_id: string;
  owner_id: string;
  started_at: string;
  ended_at: string | null;
  transfer_note: string | null;
};

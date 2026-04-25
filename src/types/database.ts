export type UserRole = "admin" | "client";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

/** Variante normalizada (marca + modelo + ano) para catálogo e seleção em formulários. */
export type MotorcycleCatalogEntry = {
  id: string;
  brand: string;
  model: string;
  year: number;
  notes: string | null;
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
  /** Se a mota foi criada a partir do catálogo. */
  catalog_entry_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceRecordStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "cancelled";

/** Manutenção: histórico na garagem do dono atual. Serviço de oficina: só admin (ex.: trabalho do proprietário anterior). */
export type ServiceRecordKind = "maintenance" | "shop_service";

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
  /** Preset de checklist aplicado (se existir). */
  checklist_preset_id?: string | null;
  record_kind: ServiceRecordKind;
};

export type MaintenanceChecklistPreset = {
  id: string;
  brand: string;
  model: string;
  service_type_name: string;
  /** Ano mínimo do modelo (inclusive). Null = sem limite. */
  year_min: number | null;
  /** Ano máximo do modelo (inclusive). Null = sem limite. */
  year_max: number | null;
  /** Opcional: ligação à entrada do catálogo usada na criação. */
  catalog_entry_id?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MaintenanceChecklistPresetItem = {
  id: string;
  preset_id: string;
  label: string;
  sort_order: number;
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

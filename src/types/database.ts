export type UserRole = "admin" | "client";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

/** Variante normalizada (marca + modelo + intervalo de anos) para catálogo e seleção em formulários. */
export type MotorcycleCatalogEntry = {
  id: string;
  brand: string;
  model: string;
  /** Primeiro ano do modelo (inclusive). */
  year_start: number;
  /** Último ano do modelo (inclusive). NULL = ainda em produção ou ano único. */
  year_end: number | null;
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

/** Valores alinhados com a constraint `service_records_revision_type_chk` na base de dados. */
export type ServiceRevisionType =
  | "Serviço Anual"
  | "Serviço de Oleo"
  | "Serviço Desmo"
  | "Serviço de Verificação de Válvulas";

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
  record_kind: ServiceRecordKind;
  /** Data do serviço (oficina). Se null, usa-se closed_at/opened_at na UI. */
  service_date: string | null;
  repair_order_ref: string | null;
  odometer_km: number | null;
  revision_type: ServiceRevisionType | null;
  /** Alvo de data para a próxima revisão (opcional). */
  next_service_due_date: string | null;
  /** Alvo de quilometragem para a próxima revisão (opcional). */
  next_service_due_km: number | null;
  updated_at: string;
};

/** Linhas da lista global de tarefas (admin). Copiadas para cada novo boletim. */
export type ServiceTaskTemplate = {
  id: string;
  label: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceTask = {
  id: string;
  service_record_id: string;
  label: string;
  sort_order: number;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
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

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "completed";

export type AppointmentRequest = {
  id: string;
  client_id: string;
  motorcycle_id: string | null;
  preferred_start: string | null;
  message: string | null;
  status: AppointmentStatus;
  created_at: string;
  /** Data/hora aceite pela oficina (pode diferir de preferred_start). */
  confirmed_start: string | null;
  confirmed_at: string | null;
  admin_note: string | null;
};

/** Configuração singleton dos dias semanais em que a oficina está fechada. */
export type WorkshopSettings = {
  id: boolean;
  /** 0 = domingo, 1 = segunda, … 6 = sábado. */
  closed_weekdays: number[];
  updated_at: string;
};

/** Data específica fechada (feriado, férias da oficina, etc.). */
export type WorkshopClosedDate = {
  id: string;
  closed_date: string; // YYYY-MM-DD
  note: string | null;
  created_at: string;
};

/** Evento de uso registado para análise de adoção (ver migration activity_events). */
export type ActivityEvent = {
  id: number;
  occurred_at: string;
  user_id: string | null;
  role: UserRole | null;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
};

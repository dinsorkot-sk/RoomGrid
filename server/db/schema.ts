import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'

// ============================================
// ENUMS (SQLite uses text, validated in app)
// ============================================
export const user_role = {
  super_admin: 'super_admin',
  owner: 'owner',
  staff: 'staff',
  tenant: 'tenant',
} as const
export type UserRole = typeof user_role[keyof typeof user_role]

export const room_status = {
  available: 'available',
  occupied: 'occupied',
  reserved: 'reserved',
  maintenance: 'maintenance',
} as const
export type RoomStatus = typeof room_status[keyof typeof room_status]

export const contract_status = {
  active: 'active',
  expired: 'expired',
  terminated: 'terminated',
} as const
export type ContractStatus = typeof contract_status[keyof typeof contract_status]

export const invoice_status = {
  draft: 'draft',
  unpaid: 'unpaid',
  paid: 'paid',
  overdue: 'overdue',
  cancelled: 'cancelled',
} as const
export type InvoiceStatus = typeof invoice_status[keyof typeof invoice_status]

export const payment_method = {
  cash: 'cash',
  transfer: 'transfer',
  promptpay: 'promptpay',
  stripe: 'stripe',
} as const
export type PaymentMethod = typeof payment_method[keyof typeof payment_method]

export const maintenance_status = {
  pending: 'pending',
  accepted: 'accepted',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
} as const
export type MaintenanceStatus = typeof maintenance_status[keyof typeof maintenance_status]

// ============================================
// TABLES
// ============================================

export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  logoUrl: text('logo_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  email: text('email').notNull(),
  passwordHash: text('password_hash'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('tenant'), // user_role
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const dormitories = sqliteTable('dormitories', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  address: text('address'),
  description: text('description'),
  totalFloors: integer('total_floors'),
  totalRooms: integer('total_rooms'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const roomTypes = sqliteTable('room_types', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  description: text('description'),
  monthlyRent: real('monthly_rent'),
  depositAmount: real('deposit_amount'),
  waterRate: real('water_rate'),
  electricRate: real('electric_rate'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  dormitoryId: text('dormitory_id').notNull().references(() => dormitories.id),
  roomTypeId: text('room_type_id').notNull().references(() => roomTypes.id),
  roomNumber: text('room_number').notNull(),
  floor: integer('floor'),
  status: text('status').notNull().default('available'), // room_status
  monthlyRent: real('monthly_rent'),
  depositAmount: real('deposit_amount'),
  waterMeterLast: real('water_meter_last'),
  electricMeterLast: real('electric_meter_last'),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => ({
  orgRoomIdx: index('rooms_org_room_idx').on(table.organizationId, table.roomNumber),
}))

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  userId: text('user_id').notNull().references(() => users.id),
  citizenId: text('citizen_id'),
  birthDate: text('birth_date'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  currentAddress: text('current_address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const contracts = sqliteTable('contracts', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  roomId: text('room_id').notNull().references(() => rooms.id),
  contractNumber: text('contract_number'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  monthlyRent: real('monthly_rent'),
  depositAmount: real('deposit_amount'),
  status: text('status').notNull().default('active'), // contract_status
  pdfUrl: text('pdf_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  roomId: text('room_id').notNull().references(() => rooms.id),
  contractId: text('contract_id').notNull().references(() => contracts.id),
  invoiceNo: text('invoice_no'),
  billingMonth: text('billing_month'),
  roomRent: real('room_rent'),
  waterUnit: real('water_unit'),
  waterPrice: real('water_price'),
  electricUnit: real('electric_unit'),
  electricPrice: real('electric_price'),
  otherAmount: real('other_amount'),
  subtotal: real('subtotal'),
  totalAmount: real('total_amount'),
  dueDate: text('due_date'),
  status: text('status').notNull().default('draft'), // invoice_status
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id),
  paymentMethod: text('payment_method').notNull(), // payment_method
  amount: real('amount').notNull(),
  paidAt: text('paid_at'),
  transactionRef: text('transaction_ref'),
  slipUrl: text('slip_url'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const meterReadings = sqliteTable('meter_readings', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  roomId: text('room_id').notNull().references(() => rooms.id),
  month: text('month').notNull(),
  waterMeterPrevious: real('water_meter_previous'),
  waterMeterCurrent: real('water_meter_current'),
  waterUnitUsed: real('water_unit_used'),
  electricMeterPrevious: real('electric_meter_previous'),
  electricMeterCurrent: real('electric_meter_current'),
  electricUnitUsed: real('electric_unit_used'),
  recordedBy: text('recorded_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const maintenanceRequests = sqliteTable('maintenance_requests', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  roomId: text('room_id').notNull().references(() => rooms.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'), // maintenance_status
  priority: text('priority'),
  assignedTo: text('assigned_to').references(() => users.id),
  completedAt: text('completed_at'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const maintenanceImages = sqliteTable('maintenance_images', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  maintenanceRequestId: text('maintenance_request_id').notNull().references(() => maintenanceRequests.id),
  imageUrl: text('image_url').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  planName: text('plan_name').notNull(),
  status: text('status').notNull(),
  maxRooms: integer('max_rooms'),
  maxUsers: integer('max_users'),
  startedAt: text('started_at'),
  expiredAt: text('expired_at'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull().references(() => organizations.id),
  userId: text('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  ipAddress: text('ip_address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
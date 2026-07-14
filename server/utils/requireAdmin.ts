import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { serverSupabaseClient } from '#supabase/server'
import type { AdminRole, AdminUserRow } from '~/types/database.types'

type RequireAdminOptions = {
  roles?: AdminRole[]
}

export async function requireAdmin(event: H3Event, options?: RequireAdminOptions) {
  const config = useRuntimeConfig()

  const client = await serverSupabaseClient(event)
  const { data: { user }, error: authError } = await client.auth.getUser()

  if (authError || !user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey,
  )

  const { data: admin, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (adminError || !admin) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const adminRow = admin as AdminUserRow

  if (options?.roles?.length) {
    const allowed = options.roles.includes(adminRow.role) || adminRow.role === 'superadmin'
    if (!allowed) {
      throw createError({ statusCode: 403, message: 'Insufficient permissions' })
    }
  }

  return { user, admin: adminRow, supabaseAdmin: supabaseAdmin as SupabaseClient }
}

export async function logModeration(
  supabaseAdmin: SupabaseClient,
  params: {
    reviewId?: string | null
    adminId: string
    action: 'approve' | 'reject' | 'edit' | 'delete' | 'create'
    note?: string
  },
) {
  await supabaseAdmin.from('moderation_log').insert({
    review_id: params.reviewId ?? null,
    admin_id: params.adminId,
    action: params.action,
    note: params.note ?? null,
  })
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

export function checkLoginRateLimit(ip: string, max = 10, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs })
    return
  }
  entry.count += 1
  if (entry.count > max) {
    throw createError({ statusCode: 429, message: 'Too many login attempts' })
  }
}

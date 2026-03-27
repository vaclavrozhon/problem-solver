import { eq, sql } from "drizzle-orm"

import { app_settings } from "../drizzle/schema"
import type { Database } from "./db"
import {
  normalize_model_visibility,
  validate_model_visibility,
  type AdminModelSettings,
  type ModelVisibility,
} from "@shared/admin/models"

const APP_SETTINGS_ID = "main"
let ensure_app_settings_table_promise: Promise<void> | null = null

export async function ensure_app_settings_table(db: Database) {
  if (!ensure_app_settings_table_promise) {
    ensure_app_settings_table_promise = db.execute(sql`
      CREATE TABLE IF NOT EXISTS "main"."app_settings" (
        "id" text PRIMARY KEY NOT NULL,
        "model_visibility" jsonb DEFAULT '{}'::jsonb NOT NULL,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        "updated_at" timestamp with time zone DEFAULT now() NOT NULL
      )
    `).then(() => undefined).catch(error => {
      ensure_app_settings_table_promise = null
      throw error
    })
  }

  await ensure_app_settings_table_promise
}

function default_admin_model_settings(): AdminModelSettings {
  return {
    model_visibility: normalize_model_visibility({}),
    updated_at: null,
  }
}

export function normalize_admin_model_visibility(input: unknown) {
  const normalized = normalize_model_visibility(input)
  const validation_error = validate_model_visibility(normalized)
  return { normalized, validation_error }
}

export async function get_admin_model_settings(db: Database): Promise<AdminModelSettings> {
  try {
    await ensure_app_settings_table(db)
    const settings = await db.query.app_settings.findFirst({
      where: eq(app_settings.id, APP_SETTINGS_ID),
      columns: {
        model_visibility: true,
        updated_at: true,
      },
    })

    const normalized = normalize_model_visibility(settings?.model_visibility)
    const safe_visibility = validate_model_visibility(normalized)
      ? normalize_model_visibility({})
      : normalized

    return {
      model_visibility: safe_visibility,
      updated_at: settings?.updated_at ?? null,
    }
  } catch (error) {
    console.error("[app_settings] Failed to load app settings, falling back to defaults:", error)
    return default_admin_model_settings()
  }
}

export async function get_admin_model_visibility(db: Database): Promise<ModelVisibility> {
  const settings = await get_admin_model_settings(db)
  return settings.model_visibility
}

export async function save_admin_model_visibility(
  db: Database,
  input: unknown,
): Promise<AdminModelSettings> {
  await ensure_app_settings_table(db)

  const { normalized, validation_error } = normalize_admin_model_visibility(input)
  if (validation_error) {
    throw new Error(validation_error)
  }

  await db.insert(app_settings)
    .values({
      id: APP_SETTINGS_ID,
      model_visibility: normalized,
    })
    .onConflictDoUpdate({
      target: app_settings.id,
      set: {
        model_visibility: normalized,
        updated_at: sql`NOW()`,
      },
    })

  return get_admin_model_settings(db)
}

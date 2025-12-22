import { createCipheriv, createDecipheriv, randomBytes, hkdfSync } from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

/**
 * Retrieves and validates the master encryption key from environment.
 * Throws if key is missing or invalid length.
 * @returns master encryption key from `.env`
 */
function get_master_key(key_version: number = 1): Buffer {
  const env_key = `ENCRYPTION_MASTER_KEY_V${key_version}`

  const key_b64 = Bun.env[env_key]
  if (!key_b64) throw new Error(`[encryption] '${env_key}' environment variable is not set!`)
  const key = Buffer.from(key_b64, "base64")
  if (key.length !== 32) throw new Error(`[encryption] '${env_key}' must be exactly 32 bytes (256 bits)!`)
  return key
}

export interface EncryptedData {
  encrypted: string,
  iv: string,
  version: number,
}

/**
 * Derives a context-specific key using.
 * This binds the encryption to a specific owner (e.g., user_id).
 */
function derive_key(master_key: Buffer, context: string): Buffer {
  const derived = hkdfSync("sha256", master_key, "", context, 32)
  return Buffer.from(derived)
}

/**
 * Encrypts an API key using `AES-256-GCM`.
 * @returns encrypted API key and IV
 */
export function encrypt_api_key(plaintext: string, user_id: string, key_version: number = 1): EncryptedData {
  const master_key = get_master_key(key_version)
  const derived_key = derive_key(master_key, user_id) // Context binding
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, derived_key, iv)
  cipher.setAAD(Buffer.from(user_id))
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ])
  const auth_tag = cipher.getAuthTag()

  // Combine ciphertext + auth_tag for storage
  const combined = Buffer.concat([encrypted, auth_tag])

  return {
    encrypted: combined.toString("base64"),
    iv: iv.toString("base64"),
    version: key_version,
  }
}

/**
 * Decrypts an API key using `AES-256-GCM`.
 * @throws if tampered or invalid.
 * @returns decrypted API key
 */
export function decrypt_api_key(encrypted: string, iv: string, user_id: string, key_version: number = 1): string {
  const master_key = get_master_key(key_version)
  const derived_key = derive_key(master_key, user_id)
  const iv_buffer = Buffer.from(iv, "base64")
  const combined = Buffer.from(encrypted, "base64")

  const ciphertext = combined.subarray(0, combined.length - AUTH_TAG_LENGTH)
  const auth_tag = combined.subarray(combined.length - AUTH_TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, derived_key, iv_buffer)
  decipher.setAAD(Buffer.from(user_id))
  decipher.setAuthTag(auth_tag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ])

  const result = decrypted.toString("utf8")
  decrypted.fill(0)

  return result
}
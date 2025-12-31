import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { randomBytes } from "crypto"

import { encrypt_api_key, decrypt_api_key } from "../src/encryption"

describe("encryption", () => {
  it("should encrypt and decrypt an API key", () => {
    const api_key = "api-key-test123"
    const user_id = "user-123"

    const encrypted = encrypt_api_key(api_key, user_id)
    const decrypted = decrypt_api_key(encrypted.encrypted, encrypted.iv, user_id, encrypted.version)

    expect(decrypted).toBe(api_key)
  })

  it("should produce different ciphertext each time (random IV)", () => {
    const api_key = "api-key-test456"
    const user_id = "user-123"

    const encrypted1 = encrypt_api_key(api_key, user_id)
    const encrypted2 = encrypt_api_key(api_key, user_id)

    expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted)
    expect(encrypted1.iv).not.toBe(encrypted2.iv)
  })

  it("should fail to decrypt with wrong user_id (context binding)", () => {
    const api_key = "api-key-test789"
    const user_id = "user-1"
    const wrong_user_id = "user-2"

    const encrypted = encrypt_api_key(api_key, user_id)

    expect(() => decrypt_api_key(encrypted.encrypted, encrypted.iv, wrong_user_id, encrypted.version))
      .toThrow()
  })

  it("should fail to decrypt tampered ciphertext", () => {
    const api_key = "api-key-test0"
    const user_id = "user-123"

    const encrypted = encrypt_api_key(api_key, user_id)
    const tampered = Buffer.from(encrypted.encrypted, "base64")
    tampered[0] ^= 0xff
    const tampered_b64 = tampered.toString("base64")

    expect(() => decrypt_api_key(tampered_b64, encrypted.iv, user_id, encrypted.version))
      .toThrow()
  })

  it("should throw when master key is missing", () => {
    delete Bun.env.ENCRYPTION_MASTER_KEY_V1

    expect(() => encrypt_api_key("test", "user-123"))
      .toThrow("environment variable is not set")
  })

  it("should throw when master key has invalid length", () => {
    Bun.env.ENCRYPTION_MASTER_KEY_V1 = Buffer.from("invalid-length-key").toString("base64")

    expect(() => encrypt_api_key("test", "user-123"))
      .toThrow("must be exactly 32 bytes")
  })
})

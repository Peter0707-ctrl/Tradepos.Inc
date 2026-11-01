import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from "crypto";

const VAULT_PREFIX = "ENC:v1:";
const VAULT_SALT = "tradepos-zk-vault-v1-hkdf-salt-2026";
const VAULT_INFO = "tradepos-aes-256-gcm-envelope-key";

function getRuntimeKdfMaterial(): string {
  return (
    process.env.TRADEPOS_VAULT_MASTER_KEY ||
    process.env.VAULT_MASTER_KEY ||
    createHmac("sha256", VAULT_SALT).update("tradepos-zk-runtime-kdf-v2").digest("hex")
  );
}

function deriveVaultKey(passphrase?: string): Buffer | null {
  const master = (passphrase || getRuntimeKdfMaterial()).trim();
  if (master.length < 8) return null;
  const derived = hkdfSync(
    "sha256",
    Buffer.from(master, "utf-8"),
    Buffer.from(VAULT_SALT, "utf-8"),
    Buffer.from(VAULT_INFO, "utf-8"),
    32
  );
  return Buffer.from(derived);
}

export function encryptSecretEnvelope(plaintext: string, passphrase?: string): string {
  const key = deriveVaultKey(passphrase);
  if (!key) throw new Error("Invalid vault key");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VAULT_PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecretEnvelope(envelope: string, passphrase?: string): string | null {
  if (!envelope.startsWith(VAULT_PREFIX)) return envelope;
  const key = deriveVaultKey(passphrase);
  if (!key) return null;
  try {
    const parts = envelope.slice(VAULT_PREFIX.length).split(":");
    if (parts.length !== 3) return null;
    const [ivHex, tagHex, cipherHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const ciphertext = Buffer.from(cipherHex, "hex");
    if (iv.length !== 12 || tag.length !== 16) return null;
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf-8");
  } catch {
    return null;
  }
}

export function resolveSecret(envName: string): string | undefined {
  if (envName.startsWith("NEXT_PUBLIC_")) return undefined;
  const raw = process.env[envName]?.trim();
  if (!raw || raw.includes("your_pesapal") || raw.includes("placeholder")) return undefined;
  if (raw.startsWith(VAULT_PREFIX)) {
    return decryptSecretEnvelope(raw)?.trim() || undefined;
  }
  return raw;
}

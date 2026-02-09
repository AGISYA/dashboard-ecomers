import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();

async function scryptHash(password, salt) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const derived = await new Promise((resolve, reject) => {
    crypto.scrypt(password, s, 32, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `scrypt:${s}:${Buffer.from(derived).toString("hex")}`;
}

async function main() {
  const phone = "081111111111";
  const passwordPlain = "admin123";
  const name = "Super Admin";
  const role = "SUPER_ADMIN";

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    console.log("User sudah ada:", phone);
    return;
  }
  const password = await scryptHash(passwordPlain);
  const created = await prisma.user.create({
    data: { name, phone, password, role, active: true },
  });
  console.log("Seed SUPER_ADMIN OK:", { phone, id: created.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

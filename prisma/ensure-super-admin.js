const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SUPER_ADMIN_ACCOUNT = "Sadmin";
const SUPER_ADMIN_PASSWORD_HASH = "$2b$12$6jnlkUOUu8t5PBAOwHQNQOZ5ofJoHdgG6jv4NtEQjnE9Ik2NwC2L6";

async function main() {
  await prisma.user.upsert({
    where: { email: SUPER_ADMIN_ACCOUNT },
    update: {
      passwordHash: SUPER_ADMIN_PASSWORD_HASH,
      nickname: SUPER_ADMIN_ACCOUNT,
      role: "admin",
      status: "active"
    },
    create: {
      email: SUPER_ADMIN_ACCOUNT,
      passwordHash: SUPER_ADMIN_PASSWORD_HASH,
      nickname: SUPER_ADMIN_ACCOUNT,
      role: "admin",
      status: "active"
    }
  });

  console.log(`[enhe-ai-tools] ensured super admin account: ${SUPER_ADMIN_ACCOUNT}`);
}

main()
  .catch((error) => {
    console.error("[enhe-ai-tools] failed to ensure super admin account", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

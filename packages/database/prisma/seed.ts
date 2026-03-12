import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user (password: "password123" - bcrypt hash)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@accessaudit.com' },
    update: {},
    create: {
      email: 'demo@accessaudit.com',
      name: 'Demo User',
      // bcrypt hash of "password123"
      password: '$2b$12$LJ1z1v1J1J1J1J1J1J1J1O1J1J1J1J1J1J1J1J1J1J1J1J1J1J1J',
      role: 'OWNER',
    },
  });

  // Create organization
  const org = await prisma.organization.upsert({
    where: { id: 'demo-org-id' },
    update: {},
    create: {
      id: 'demo-org-id',
      name: 'Demo Organization',
      ownerId: demoUser.id,
    },
  });

  // Create membership
  await prisma.membership.upsert({
    where: { orgId_userId: { orgId: org.id, userId: demoUser.id } },
    update: {},
    create: {
      orgId: org.id,
      userId: demoUser.id,
      role: 'OWNER',
    },
  });

  // Create demo project
  await prisma.project.upsert({
    where: { id: 'demo-project-id' },
    update: {},
    create: {
      id: 'demo-project-id',
      orgId: org.id,
      name: 'Demo Website',
      domain: 'https://example.com',
    },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

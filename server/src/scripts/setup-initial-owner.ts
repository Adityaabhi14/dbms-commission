/**
 * APD MUSIC CLASS — INITIAL OWNER PROVISIONING SCRIPT (PHASE 4)
 * Secure administrative bootstrapping tool.
 * Owner accounts can NEVER be registered through public signup APIs.
 */

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db } from '../database/repository';

dotenv.config();

export async function setupInitialOwner() {
  console.log('🔒 Initializing Protected Owner Account Provisioning...');

  const ownerEmail = (process.env.INITIAL_OWNER_EMAIL || 'director@apdmusicclass.com').toLowerCase().trim();
  const rawPassword = process.env.INITIAL_OWNER_PASSWORD || 'directorSecure2026';
  const ownerName = process.env.INITIAL_OWNER_NAME || 'Dr. Alok Prasad';
  const ownerPhone = process.env.INITIAL_OWNER_PHONE || '+91 40 4821 7733';

  const existingUser = await db.users.findUnique({ email: ownerEmail });

  if (existingUser) {
    console.log(`ℹ️  Owner account '${ownerEmail}' already exists (ID: ${existingUser.id}). Updating credentials...`);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);
    await db.users.updatePassword(existingUser.id, passwordHash);
    console.log(`✅ Owner credentials successfully updated for '${ownerEmail}'.`);
    return existingUser;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(rawPassword, salt);

  const newOwner = await db.users.create({
    email: ownerEmail,
    passwordHash,
    fullName: ownerName,
    phone: ownerPhone,
    role: 'OWNER'
  });

  await db.audit.create({
    entityType: 'USER',
    entityId: newOwner.id,
    action: 'PROVISION_INITIAL_OWNER',
    performedByUserId: newOwner.id,
    changes: { email: ownerEmail, role: 'OWNER' }
  });

  console.log(`✅ Successfully provisioned protected Owner account:`);
  console.log(`   - User ID: ${newOwner.id}`);
  console.log(`   - Email:   ${newOwner.email}`);
  console.log(`   - Role:    ${newOwner.role}`);
  console.log(`   - Name:    ${newOwner.fullName}`);
  console.log('🎶 APD MUSIC CLASS Executive Administration is active.');
  return newOwner;
}

if (process.argv[1] && process.argv[1].endsWith('setup-initial-owner.ts')) {
  setupInitialOwner().catch(err => {
    console.error('❌ Owner provisioning failed:', err);
    process.exit(1);
  });
}

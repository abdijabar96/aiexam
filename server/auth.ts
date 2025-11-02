// Using PostgreSQL database for access code storage
// Reference: blueprint:javascript_database integration

import crypto from 'crypto';
import { db } from './db.js';
import { accessCodes, usedCodes } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

interface CodesData {
  accessCodes: Array<{ code: string; createdAt: string }>;
  usedCodes: string[];
}

export function generateAccessCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function createAccessCode(): Promise<string> {
  const code = generateAccessCode();
  
  await db.insert(accessCodes).values({
    code,
  });
  
  return code;
}

export async function verifyAccessCode(code: string): Promise<boolean> {
  try {
    // Check if code exists in access codes (reusable - unlimited uses)
    const [existingCode] = await db
      .select()
      .from(accessCodes)
      .where(eq(accessCodes.code, code));
    
    if (!existingCode) {
      return false;
    }
    
    // Code is valid - no need to delete, allowing unlimited reuse
    return true;
  } catch (error) {
    console.error('Error verifying access code:', error);
    return false;
  }
}

export async function getAllCodes(): Promise<CodesData> {
  const [availableCodes, codes] = await Promise.all([
    db.select().from(accessCodes),
    db.select().from(usedCodes),
  ]);
  
  return {
    accessCodes: availableCodes.map(c => ({
      code: c.code,
      createdAt: c.createdAt.toISOString(),
    })),
    usedCodes: codes.map(c => c.code),
  };
}

export async function deleteAccessCode(code: string): Promise<boolean> {
  try {
    const result = await db.delete(accessCodes).where(eq(accessCodes.code, code));
    return true;
  } catch (error) {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  return adminPassword && password === adminPassword;
}

export function generateAdminToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

const adminTokens = new Set<string>();

export function createAdminSession(): string {
  const token = generateAdminToken();
  adminTokens.add(token);
  return token;
}

export function verifyAdminToken(token: string): boolean {
  return adminTokens.has(token);
}

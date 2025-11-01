import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_FILE = path.join(process.cwd(), 'data', 'codes.json');

interface CodesData {
  accessCodes: Array<{ code: string; createdAt: string }>;
  usedCodes: string[];
}

async function readCodesFile(): Promise<CodesData> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { accessCodes: [], usedCodes: [] };
  }
}

async function writeCodesFile(data: CodesData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export function generateAccessCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function createAccessCode(): Promise<string> {
  const data = await readCodesFile();
  const code = generateAccessCode();
  
  data.accessCodes.push({
    code,
    createdAt: new Date().toISOString(),
  });
  
  await writeCodesFile(data);
  return code;
}

export async function verifyAccessCode(code: string): Promise<boolean> {
  const data = await readCodesFile();
  
  const codeIndex = data.accessCodes.findIndex(item => item.code === code);
  
  if (codeIndex === -1) {
    return false;
  }
  
  const usedCode = data.accessCodes.splice(codeIndex, 1)[0];
  data.usedCodes.push(usedCode.code);
  
  await writeCodesFile(data);
  return true;
}

export async function getAllCodes(): Promise<CodesData> {
  return await readCodesFile();
}

export async function deleteAccessCode(code: string): Promise<boolean> {
  const data = await readCodesFile();
  const initialLength = data.accessCodes.length;
  
  data.accessCodes = data.accessCodes.filter(item => item.code !== code);
  
  if (data.accessCodes.length < initialLength) {
    await writeCodesFile(data);
    return true;
  }
  
  return false;
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

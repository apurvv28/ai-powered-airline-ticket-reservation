import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// Hash password
export async function hashPassword(password) {
  // Lazy-import bcrypt so edge/middleware that import this file don't force
  // loading a native module (node-gyp) into the edge runtime.
  const { default: bcrypt } = await import('bcrypt');
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  const { default: bcrypt } = await import('bcrypt');
  return bcrypt.compare(password, hashedPassword);
}

// Create JWT token
export async function createToken(userId, email) {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifyToken(token) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload;
  } catch (error) {
    return null;
  }
}

// Get current user from session
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  
  if (!token) return null;
  
  const payload = await verifyToken(token.value);
  return payload;
}
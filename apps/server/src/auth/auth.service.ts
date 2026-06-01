import {
  LoginSchema,
  RegisterSchema,
  zodParseOrThrow,
  type LoginDTO,
  type RegisterDTO,
} from "shared";
import { BadRequestError } from "../errors/apiErrors.js";
import { prisma } from "../lib/prisma/index.js";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { emailService } from "../lib/email.js";
import { environment } from "../config/environment.js";

const BCRYPT_COST = 12;
// Precomputed once at startup so login does a real bcrypt compare even when the
// email doesn't exist — equalizes response timing (no user-enumeration leak).
const DUMMY_HASH = bcrypt.hashSync("timing-safe-dummy-password", BCRYPT_COST);

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TTL_MS = 60 * 60 * 1000; // 1h

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
function generateToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString("hex");
  return { raw, hash: hashToken(raw) };
}

class AuthService {
  async register(input: RegisterDTO) {
    const data = zodParseOrThrow(RegisterSchema, input);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new BadRequestError("User already exists", "email");

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_COST);

    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
      },
    });
  }

  async login(input: LoginDTO) {
    const data = zodParseOrThrow(LoginSchema, input);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Always run a compare (dummy hash for unknown email) and return one generic
    // error for both "no such user" and "wrong password" — no enumeration.
    const valid = await bcrypt.compare(
      data.password,
      user?.passwordHash ?? DUMMY_HASH,
    );
    if (!user || !valid) {
      throw new BadRequestError("Invalid email or password");
    }

    return user;
  }

  async sendVerificationEmail(userId: string, email: string) {
    const { raw, hash } = generateToken();
    await prisma.authToken.create({
      data: {
        userId,
        type: "EMAIL_VERIFY",
        tokenHash: hash,
        expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
      },
    });
    const link = `${environment.CLIENT_URL}/verify-email?token=${raw}`;
    await emailService.sendVerification(email, link);
  }

  async verifyEmail(rawToken: string) {
    const token = await prisma.authToken.findFirst({
      where: {
        tokenHash: hashToken(rawToken),
        type: "EMAIL_VERIFY",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!token) throw new BadRequestError("Invalid or expired verification link");

    await prisma.$transaction([
      prisma.user.update({
        where: { id: token.userId },
        data: { emailVerified: true },
      }),
      prisma.authToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  // Enumeration-safe: always resolves; only sends if the account exists.
  async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const { raw, hash } = generateToken();
    await prisma.authToken.create({
      data: {
        userId: user.id,
        type: "PASSWORD_RESET",
        tokenHash: hash,
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });
    const link = `${environment.CLIENT_URL}/reset-password?token=${raw}`;
    await emailService.sendPasswordReset(email, link);
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const token = await prisma.authToken.findFirst({
      where: {
        tokenHash: hashToken(rawToken),
        type: "PASSWORD_RESET",
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (!token) throw new BadRequestError("Invalid or expired reset link");

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      }),
      // Burn this and any other outstanding reset tokens for the user.
      prisma.authToken.updateMany({
        where: {
          userId: token.userId,
          type: "PASSWORD_RESET",
          usedAt: null,
        },
        data: { usedAt: new Date() },
      }),
    ]);
  }
}

export const authService = new AuthService();

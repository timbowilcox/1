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

const BCRYPT_COST = 12;
// Precomputed once at startup so login does a real bcrypt compare even when the
// email doesn't exist — equalizes response timing (no user-enumeration leak).
const DUMMY_HASH = bcrypt.hashSync("timing-safe-dummy-password", BCRYPT_COST);

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
}

export const authService = new AuthService();

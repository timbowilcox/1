import type { UserDTO } from "../users/users.dto.js";

export default function mapUser(user: any): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    stripeCustomerId: user.stripeCustomerId,
    createdAt: user.createdAt,
    avatarUrl: user.avatarUrl || null,
    emailVerified: !!user.emailVerified,
    creditsRemaining: user.creditsRemaining || 0,
  };
}
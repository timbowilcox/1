export type UserDTO = {
  stripeCustomerId: string | null;
  email: string;
  name: string;
  id: string;
  createdAt: Date;
  avatarUrl: string | null;
  emailVerified: boolean;
  creditsRemaining: number;
};

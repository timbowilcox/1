import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, PlanTier, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: pool });

const PLAN_LIMITS = {
  FREE: parseInt(process.env.PLAN_LIMIT_FREE || "10", 10),
  PRO: parseInt(process.env.PLAN_LIMIT_PRO || "100", 10),
  PRO_PLUS: parseInt(process.env.PLAN_LIMIT_PRO_PLUS || "500", 10),
};

(async () => {
  // Test fixtures only — weak shared password + mock subscriptions. Never prod.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "seed-users creates test accounts and must NEVER run in production.",
    );
  }

  console.log("Seed started");

  const hash = await bcrypt.hash("qqqqqq", 10);

  const usersToSeed = [
    { email: "free@gmail.com", name: "Free User", plan: null },
    { email: "pro@gmail.com", name: "Pro User", plan: PlanTier.PRO },
    { email: "proplus@gmail.com", name: "Pro Plus User", plan: PlanTier.PRO_PLUS }
  ];

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  for (const userData of usersToSeed) {
    const user = await prisma.user.upsert({
      where: {
        email: userData.email,
      },
      create: {
        name: userData.name,
        email: userData.email,
        passwordHash: hash,
      },
      update: {},
    });

    if (userData.plan) {
      const stripeSubId = `mock_sub_${userData.plan.toLowerCase()}_${user.id}`;
      
      await prisma.subscription.upsert({
        where: {
          stripeSubscriptionId: stripeSubId,
        },
        create: {
          userId: user.id,
          stripeSubscriptionId: stripeSubId,
          planTier: userData.plan,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: nextMonth,
        },
        update: {
          planTier: userData.plan,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: nextMonth,
        },
      });
    }

    await prisma.usageTracking.deleteMany({
      where: { userId: user.id },
    });

    const limit = userData.plan ? PLAN_LIMITS[userData.plan] : PLAN_LIMITS.FREE;

    await prisma.usageTracking.create({
      data: {
        userId: user.id,
        periodStart: now,
        periodEnd: nextMonth,
        imagesUsed: 0,
        imagesLimit: limit,
      },
    });
  }

  console.log("✅ Seed for users finished successfully!");
  await prisma.$disconnect();
})();
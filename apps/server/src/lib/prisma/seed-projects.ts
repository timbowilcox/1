import { PrismaPg } from "@prisma/adapter-pg";
import { 
  PrismaClient, 
  StylePreset, 
  Lighting, 
  Creativity, 
  Aesthetic 
} from "@prisma/client";
import "dotenv/config";
import { imagesService } from "../../images/images.service.js";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: pool });

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
  "https://images.unsplash.com/photo-1616594039964-ae9021a400a0",
  "https://images.unsplash.com/photo-1556912173-3bb406ef7e77",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f",
  "https://images.unsplash.com/photo-1497366216548-37526070297c",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1616046229478-9901c5536a45"
];

const PROJECT_NAMES = [
  "The Highland Loft", "Malibu Beach House", "Downtown Concrete",
  "Sunset Valley Remodel", "Cozy Cabin Retreat", "Modern Glass Villa",
  "Urban Studio", "Lakeside Mansion", "Minimalist Apartment",
  "Classic Victorian Update", "Desert Oasis", "Mountain View Lodge",
  "Riverfront Condo", "Historic Brownstone", "Eco-Friendly Home",
  "Skyline Penthouse", "Sunny Bungalow", "Forest Hideaway",
  "Oceanfront Estate", "Industrial Loft", "Zen Garden Home",
  "Modern Farmhouse", "Scandinavian Haven"
];

const ADDRESSES = [
  "1284 Highland Ave, Seattle, WA", "42 Ocean Drive, Malibu, CA",
  "99 Industrial Way, Brooklyn, NY", "Pending Location",
  "12 Bear Creek, Aspen, CO", "777 Glass Blvd, Austin, TX",
  "101 City Center, Chicago, IL", "88 Lake Rd, Tahoe, NV",
  "404 Blank St, Portland, OR", "1890 Old Town, Boston, MA"
];

const STYLES = Object.values(StylePreset);
const LIGHTING_OPTIONS = Object.values(Lighting);
const CREATIVITY_OPTIONS = Object.values(Creativity);
const AESTHETIC_OPTIONS = Object.values(Aesthetic);

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const getRandomElements = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

(async () => {
  // Test fixtures attached to the seed test users — never prod.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "seed-projects creates test fixtures and must NEVER run in production.",
    );
  }

  console.log("🌱 Seed for projects started");

  const usersConfig = [
    { email: "free@gmail.com", projectCount: 2 },
    { email: "pro@gmail.com", projectCount: 5 },
    { email: "proplus@gmail.com", projectCount: 15 }
  ];

  let globalProjectIndex = 0;

  for (const config of usersConfig) {
    const user = await prisma.user.findUnique({
      where: { email: config.email },
    });

    if (!user) {
      console.error(`❌ User ${config.email} not found! Skipping.`);
      continue;
    }

    await prisma.project.deleteMany({
      where: { userId: user.id }
    });

    let imagesUsedInSeed = 0;

    console.log(`⬇️ Creating ${config.projectCount} projects for ${config.email}...`);

    for (let i = 0; i < config.projectCount; i++) {
      const hasImages = Math.random() > 0.2;
      const nameIndex = globalProjectIndex % PROJECT_NAMES.length;
      const name = PROJECT_NAMES[nameIndex] || `Test Project ${globalProjectIndex}`;
      const address = getRandomElement(ADDRESSES);
      const style = getRandomElement(STYLES);

      const project = await prisma.project.create({
        data: {
          userId: user.id,
          name,
          address,
          stylePreset: style,
        }
      });

      if (hasImages) {
        const imagesCount = Math.floor(Math.random() * 3) + 1;
        const selectedImageUrls = getRandomElements(MOCK_IMAGES, imagesCount);

        const uploadedTmpImages = await imagesService.uploadImagesByUrls(selectedImageUrls);

        for (let j = 0; j < uploadedTmpImages.length; j++) {
          const tmpImage = uploadedTmpImages[j];
          
          if (tmpImage && tmpImage.path) {
            const origPath = await imagesService.moveImageToProject(tmpImage.path, project.id);
            
            const originalImage = await prisma.originalProjectImage.create({
              data: {
                projectId: project.id,
                originalPath: origPath,
                orderIndex: j
              }
            });

            const shouldHaveStyledImages = Math.random() > 0.3;
            
            if (shouldHaveStyledImages) {
              const stylesCount = Math.floor(Math.random() * 2) + 1;
              const styleUrls = getRandomElements(MOCK_IMAGES, stylesCount);
              const uploadedTmpStyles = await imagesService.uploadImagesByUrls(styleUrls);

              const styledImagesData = [];

              for (const tmpStyle of uploadedTmpStyles) {
                if (tmpStyle && tmpStyle.path) {
                  const restyledPath = await imagesService.moveImageToProject(tmpStyle.path, project.id);
                  styledImagesData.push({
                    originalImageId: originalImage.id,
                    restyledPath: restyledPath,
                    lighting: getRandomElement(LIGHTING_OPTIONS),
                    creativity: getRandomElement(CREATIVITY_OPTIONS),
                    aesthetic: getRandomElement(AESTHETIC_OPTIONS),
                  });
                }
              }

              if (styledImagesData.length > 0) {
                await prisma.styledProjectImage.createMany({
                  data: styledImagesData
                });
                imagesUsedInSeed += styledImagesData.length;
              }
            }
          }
        }
      }

      console.log(`✅ Created project ${i + 1}/${config.projectCount} for ${config.email}: ${name}`);
      globalProjectIndex++;
    }

    if (imagesUsedInSeed > 0) {
      const usageTracking = await prisma.usageTracking.findFirst({
        where: { userId: user.id },
        orderBy: { periodEnd: 'desc' }
      });

      if (usageTracking) {
        await prisma.usageTracking.update({
          where: { id: usageTracking.id },
          data: { imagesUsed: { increment: imagesUsedInSeed } }
        });
      }
    }
  }

  console.log("✅ Seed for all users' projects finished successfully!");
  await prisma.$disconnect();
})();
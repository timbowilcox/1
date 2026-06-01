import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import "dotenv/config";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: pool });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
const bucketName = process.env.SUPABASE_BUCKET_NAME || "";

const supabase = createClient(supabaseUrl, supabaseKey);

const main = `
  Interior redesign of the same room shown in the reference image.
  Keep the exact room geometry, layout, walls, ceiling height, windows, doors, perspective and camera angle unchanged.
  Do not alter the structure of the room.

  Replace all furniture, decor and interior elements with a new interior design.
  Rearrange all furniture and interior objects completely within the room while maintaining the original geometry.
  The new design must look realistic, coherent and professionally designed.

  High-quality interior design render, photorealistic lighting, natural shadows, realistic materials, interior architecture photography.
  No distortion, no changes to room proportions, no added or removed walls.
`;

const rawStyles = [
  {
    preset: "SCANDINAVIAN",
    displayName: "Scandinavian",
    description: "Light, airy spaces with functional simplicity and natural materials",
    colorPalette: "White walls, blonde wood, minimal decor",
    sourceUrl: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=800&q=80",
    content:
      main +
      `
        Scandinavian interior design style.
        Bright, airy and functional space.
        White walls, blonde wood, minimal decor, natural materials.
        Cozy, simple, clean and practical design.
      `,
  },
  {
    preset: "MINIMAL_LUXE",
    displayName: "Minimal Luxe",
    description: "Refined elegance through restrained sophistication",
    colorPalette: "Neutral palette, high-end materials, clean lines",
    sourceUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    content:
      main +
      `
        Minimal luxe interior design.
        Elegant, refined and minimal space.
        Neutral palette, high-end materials, clean lines.
        Subtle luxury, calm and sophisticated atmosphere.
      `,
  },
  {
    preset: "MODERN_COASTAL",
    displayName: "Modern Coastal",
    description: "Relaxed seaside living with contemporary polish",
    colorPalette: "Blues, whites, natural textures, ocean references",
    sourceUrl: "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&q=80",
    content:
      main +
      `
        Modern coastal interior design.
        Relaxed seaside atmosphere with modern styling.
        Blues, whites, natural textures, ocean-inspired accents.
        Bright, fresh and airy environment.
      `,
  },
  {
    preset: "JAPANDI",
    displayName: "Japandi",
    description: "Japanese minimalism meets Scandinavian warmth",
    colorPalette: "Muted earth tones, organic shapes, zen simplicity",
    sourceUrl: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=800&q=80",
    content:
      main +
      `
        Japandi interior design.
        Minimalist, calm and balanced space.
        Muted earth tones, organic shapes, natural materials.
        Zen simplicity with warm Scandinavian touch.
      `,
  },
  {
    preset: "BOLD_COLOUR",
    displayName: "Bold Colour",
    description: "Vibrant, expressive spaces that make a statement",
    colorPalette: "Saturated hues, colour blocking, artistic accents",
    sourceUrl: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&q=80",
    content:
      main +
      `
        Bold colour interior design.
        Vibrant and expressive space.
        Strong saturated colours, colour blocking, artistic accents.
        Energetic, modern and statement-making atmosphere.
      `,
  },
  {
    preset: "URBAN_INDUSTRIAL",
    displayName: "Urban Industrial",
    description: "Raw urban aesthetic with exposed architectural elements",
    colorPalette: "Exposed brick, metal, concrete, Edison bulbs",
    sourceUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    content:
      main +
      `
        Urban industrial interior design.
        Raw, urban and loft-style space.
        Exposed brick, metal, concrete, industrial lighting.
        Minimal decor, strong architectural character.
      `,
  },
  {
    preset: "HAMPTONS_CLASSIC",
    displayName: "Hamptons Classic",
    description: "Timeless coastal elegance inspired by East Coast estates",
    colorPalette: "Navy/white palette, shiplap, classic furniture",
    sourceUrl: "https://plus.unsplash.com/premium_photo-1661915661139-5b6a4e4a6fcc?w=800&q=80",
    content:
      main +
      `
        Hamptons classic interior design.
        Timeless, elegant coastal style.
        Navy and white palette, classic furniture, light and airy space.
        Refined, calm and sophisticated atmosphere.
      `,
  },
  {
    preset: "MID_CENTURY_MODERN",
    displayName: "Mid-Century Modern",
    description: "Retro-futuristic design from the 1950s-60s golden era",
    colorPalette: "Organic curves, tapered legs, statement lighting",
    sourceUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&q=80",
    content:
      main +
      `
        Mid-century modern interior design.
        Retro yet timeless style.
        Organic curves, tapered legs, statement lighting.
        Warm wood tones and clean modern composition.
      `,
  },
];

(async () => {
  console.log("Seed for styles and prompts started");

  if (!supabaseUrl || !supabaseKey || !bucketName) {
    console.error("Missing Supabase environment variables.");
    process.exit(1);
  }

  const processedStyles = [];

  for (const item of rawStyles) {
    console.log(`Downloading image for ${item.preset}...`);
    
    try {
      const response = await fetch(item.sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get("content-type") || "image/jpeg";
      
      const originalPath = `styles/${item.preset.toLowerCase()}.jpg`;
      const thumbPath = `styles/${item.preset.toLowerCase()}_thumb.jpg`;
      
      console.log(`Uploading original to Supabase: ${originalPath}...`);
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(originalPath, buffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      console.log(`Generating and uploading thumbnail: ${thumbPath}...`);
      const thumbBuffer = await sharp(buffer)
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const { error: thumbUploadError } = await supabase.storage
        .from(bucketName)
        .upload(thumbPath, thumbBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (thumbUploadError) throw thumbUploadError;

      processedStyles.push({
        preset: item.preset as any,
        displayName: item.displayName,
        description: item.description,
        colorPalette: item.colorPalette,
        content: item.content,
        imageUrl: thumbPath,
      });
      
    } catch (error) {
      console.error(`Error processing style ${item.preset}:`, error);
    }
  }

  // Idempotent upsert — the style catalog is production data; never wipe it
  // (the previous deleteMany({}) erased the whole catalog on every run).
  if (processedStyles.length > 0) {
    for (const s of processedStyles) {
      await prisma.style.upsert({
        where: { preset: s.preset },
        create: s,
        update: {
          displayName: s.displayName,
          description: s.description,
          colorPalette: s.colorPalette,
          content: s.content,
          imageUrl: s.imageUrl,
        },
      });
    }
    console.log(`Successfully upserted ${processedStyles.length} styles to the database.`);
  } else {
    console.log("No styles were processed successfully.");
  }

  console.log("Seed for styles and prompts finished");
  await prisma.$disconnect();
})();
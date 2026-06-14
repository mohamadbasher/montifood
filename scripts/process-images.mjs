import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public");
const p = (f) => path.join(pub, f);

// 1) Logo -> clean PNG, max 512px, keep aspect.
await sharp(p("logo.png.jpeg"))
  .resize(512, 512, { fit: "inside" })
  .png()
  .toFile(p("logo.png"));

// 2) Products -> uniform 800x800 squares on white, as PNG.
const products = [
  { src: "product-hilal-18.jpg.jpeg", out: "product-hilal-18.png" },
  { src: "product-barkav-17.jpg.png", out: "product-barkav-17.png" },
  { src: "product-hilal-3.jpg.jpeg", out: "product-hilal-3.png" },
];

for (const { src, out } of products) {
  await sharp(p(src))
    .resize(800, 800, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toFile(p(out));
  console.log("✓", out);
}

console.log("Done.");

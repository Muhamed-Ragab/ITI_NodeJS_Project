import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

const config = {
  entryPoints: ["src/server.js"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile: "dist/server.js",
  minify: true,
  external: [
    "bcryptjs",
    "cloudinary",
    "cors",
    "dotenv",
    "express",
    "http-status-codes",
    "jsonwebtoken",
    "mongoose",
    "morgan",
    "nodemailer",
    "slugify",
    "stripe",
    "zod",
  ],
};

if (isWatch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(config);
  console.log("Build complete!");
}

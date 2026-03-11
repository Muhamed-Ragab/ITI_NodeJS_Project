import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";

const isWatch = process.argv.includes("--watch");
const isVercel = process.env.VERCEL === "1";

// Build app.js and init.js for use in api/index.js
const config = {
	entryPoints: ["src/app.js", "src/init.js"],
	bundle: true,
	platform: "node",
	format: "esm",
	target: "node20",
	outdir: "dist",
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
		"@emailjs/nodejs",
		"resend",
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

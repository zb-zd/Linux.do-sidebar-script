const fs = require("fs/promises");
const path = require("path");
const terser = require("terser");

const INPUT_FILE = "linux-do-helper.user.js";
const OUTPUT_FILE = "linux-do-helper.min.user.js";

async function build() {
  const inputPath = path.resolve(__dirname, INPUT_FILE);
  const outputPath = path.resolve(__dirname, OUTPUT_FILE);
  const source = await fs.readFile(inputPath, "utf8");

  const headerMatch = source.match(
    /\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/
  );

  if (!headerMatch) {
    throw new Error("Userscript metadata block not found.");
  }

  const header = headerMatch[0].trim();
  const body = source.replace(headerMatch[0], "").trim();

  const result = await terser.minify(body, {
    compress: true,
    mangle: true,
  });

  if (!result.code) {
    throw new Error("Terser returned empty output.");
  }

  const output = `${header}\n\n${result.code}\n`;
  await fs.writeFile(outputPath, output, "utf8");
}

build().catch((error) => {
  console.error("Build failed:", error.message);
  process.exit(1);
});

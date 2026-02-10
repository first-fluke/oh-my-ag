#!/usr/bin/env node
/**
 * Search Index Generator
 * 
 * This script generates a search index from all markdown documentation files.
 * Run during build time to create public/search-index.json
 */

import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, "..", "content");
const OUTPUT_FILE = path.join(__dirname, "..", "public", "search-index.json");

/**
 * Remove markdown syntax for plain text search
 */
function stripMarkdown(markdown) {
  return markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, " ")
    // Remove HTML tags
    .replace(/<[^>]+>/g, " ")
    // Remove heading markers
    .replace(/^#+\s+/gm, " ")
    // Remove bold/italic markers
    .replace(/(\*\*|__|\*|_)/g, " ")
    // Remove blockquotes
    .replace(/^>\s*/gm, " ")
    // Remove list markers
    .replace(/^[-*+]\s+/gm, " ")
    .replace(/^\d+\.\s+/gm, " ")
    // Remove horizontal rules
    .replace(/^[-*]{3,}$/gm, " ")
    // Remove extra whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract searchable content from markdown
 */
function extractContent(body) {
  // Get first 5000 characters for search content
  const plainText = stripMarkdown(body);
  return plainText.slice(0, 5000);
}

/**
 * Generate search index from all markdown files
 */
async function generateSearchIndex() {
  const documents = [];
  const id = 0;

  const langs = ["en", "ko"];
  
  for (const lang of langs) {
    const langDir = path.join(CONTENT_DIR, lang);
    
    try {
      const entries = await fs.readdir(langDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        const groupDir = path.join(langDir, entry.name);
        const files = await fs.readdir(groupDir);
        
        for (const file of files) {
          if (!file.endsWith(".md")) continue;
          
          const filePath = path.join(groupDir, file);
          const content = await fs.readFile(filePath, "utf-8");
          const { data, content: body } = matter(content);
          
          const slug = file.replace(".md", "");
          const group = entry.name;
          
          documents.push({
            id: `${lang}/${group}/${slug}`,
            lang,
            group,
            slug,
            title: data.title || slug,
            description: data.description || "",
            content: extractContent(body),
            href: `/${lang}/${group}/${slug}`,
          });
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not process ${langDir}:`, error.message);
    }
  }

  return documents;
}

/**
 * Main function
 */
async function main() {
  console.log("🔍 Generating search index...");
  
  try {
    const documents = await generateSearchIndex();
    
    // Ensure public directory exists
    const publicDir = path.dirname(OUTPUT_FILE);
    await fs.mkdir(publicDir, { recursive: true });
    
    // Write index
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify({ documents, generatedAt: new Date().toISOString() }, null, 2)
    );
    
    console.log(`✅ Search index generated with ${documents.length} documents`);
    console.log(`📁 Output: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("❌ Failed to generate search index:", error);
    process.exit(1);
  }
}

main();

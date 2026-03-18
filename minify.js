const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
    console.error('Usage: node minify.js <file-path>');
    process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// Simple minification logic
let minified = content
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    .replace(/>\s+</g, '><')          // Remove whitespace between tags
    .replace(/\s{2,}/g, ' ')         // Collapse multiple spaces
    .trim();

// Very basic CSS minification inside <style> tags
minified = minified.replace(/<style>([\s\S]*?)<\/style>/g, (match, p1) => {
    const css = p1
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove CSS comments
        .replace(/\s*([\{\}:;,])\s*/g, '$1') // Remove spaces around delimiters
        .replace(/\n/g, '') // Remove newlines
        .trim();
    return `<style>${css}</style>`;
});

// Very basic JS minification inside <script> tags (risky, but focusing on simple ones)
minified = minified.replace(/<script>([\s\S]*?)<\/script>/g, (match, p1) => {
    // Only minify internal scripts, skip if it looks complex or has templates
    if (p1.includes('`') || p1.includes('//')) {
         // Minimal JS minification to avoid breaking things
         const js = p1
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/^\s*\/\/.*/gm, '')      // Remove single line comments (basic)
            .replace(/\s{2,}/g, ' ')
            .trim();
        return `<script>${js}</script>`;
    }
    const js = p1
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s*([\{\}:;,=])\s*/g, '$1')
        .replace(/\n/g, '')
        .trim();
    return `<script>${js}</script>`;
});

const outputPath = filePath.replace('.html', '.min.html');
fs.writeFileSync(outputPath, minified);

console.log(`Original size: ${content.length} bytes`);
console.log(`Minified size: ${minified.length} bytes`);
console.log(`Saved to: ${outputPath}`);

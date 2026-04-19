const fs = require('fs');
const path = require('path');

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const obj = {};
  const lines = match[1].split('\n');
  let currentKey = null;

  lines.forEach(line => {
    // Check if line starts a new key
    const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)/);
    if (keyMatch) {
      currentKey = keyMatch[1].trim();
      obj[currentKey] = keyMatch[2].trim().replace(/^["']|["']$/g, '');
    } else if (currentKey && line.startsWith('  ')) {
      // Multi-line value continuation
      obj[currentKey] += ' ' + line.trim().replace(/^["']|["']$/g, '');
    }
  });

  return obj;
}

function loadFolder(folder) {
  if (!fs.existsSync(folder)) return [];
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.md'));
  if (!files.length) return [];
  return files
    .map(f => parseFrontmatter(fs.readFileSync(path.join(folder, f), 'utf8')))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

if (!fs.existsSync('./_posts/blog')) fs.mkdirSync('./_posts/blog', { recursive: true });
if (!fs.existsSync('./_posts/research')) fs.mkdirSync('./_posts/research', { recursive: true });

const blogs = loadFolder('./_posts/blog');
const research = loadFolder('./_posts/research');

fs.writeFileSync('./content-data.js',
  `const BLOGS = ${JSON.stringify(blogs, null, 2)};\n` +
  `const RESEARCH = ${JSON.stringify(research, null, 2)};\n`
);

console.log(`Generated: ${blogs.length} blogs, ${research.length} research papers`);

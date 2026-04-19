const fs = require('fs');
const path = require('path');

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const obj = {};
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(': ');
    if (k && k.trim()) obj[k.trim()] = v.join(': ').trim().replace(/^"|"$/g, '');
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

if (!fs.existsSync('./content/blog')) fs.mkdirSync('./content/blog', { recursive: true });
if (!fs.existsSync('./content/research')) fs.mkdirSync('./content/research', { recursive: true });

const blogs = loadFolder('./content/blog');
const research = loadFolder('./content/research');

fs.writeFileSync('./content-data.js',
  `const BLOGS = ${JSON.stringify(blogs, null, 2)};\n` +
  `const RESEARCH = ${JSON.stringify(research, null, 2)};\n`
);

console.log(`Generated: ${blogs.length} blogs, ${research.length} research papers`);

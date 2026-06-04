import fs from 'fs';
import path from 'path';

const readme = fs.readFileSync('awesome-list/README.md', 'utf-8');
const lines = readme.split('\n');

const data = [];
let currentCategory = '';

for (const line of lines) {
  if (line.startsWith('## ')) {
    currentCategory = line.replace('## ', '').trim();
    if (['Contents', 'Changelog', 'Star History', 'Market Stats and Benchmarks 2026', 'Newsletters and Communities', 'Local and Self-Hosted AI', 'AI Governance and Compliance', 'About'].includes(currentCategory)) {
        currentCategory = '';
    }
  } else if (currentCategory && line.startsWith('- [')) {
    const simpleMatch = line.match(/^- \[(.*?)\]\((.*?)\)\s*(.*?)$/);
    if (simpleMatch) {
      let [, name, url, descriptionRaw] = simpleMatch;
      
      let description = descriptionRaw;
      if (description.startsWith('- ')) {
        description = description.slice(2).trim();
      }

      let tags = [];
      const tagMatch = description.match(/\(🏷️\s+(.*?)\)[.]?$/);
      if (tagMatch) {
         tags = tagMatch[1].replace(/`/g, '').split(' ').filter(Boolean);
         description = description.replace(tagMatch[0], '').trim();
      } else {
         const emojiMatch = description.match(/🏷️\s+(.*?)(?:\)|\])?\.?$/);
         if (emojiMatch) {
            tags = emojiMatch[1].replace(/`/g, '').split(' ').filter(Boolean);
            description = description.split('🏷️')[0].replace(/\($/, '').trim();
         }
      }
      
      data.push({
        name,
        url,
        description,
        tags,
        category: currentCategory
      });
    }
  }
}

fs.writeFileSync('src/data.json', JSON.stringify(data, null, 2));
console.log(`Parsed ${data.length} items`);

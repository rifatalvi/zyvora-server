const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir(path.join(process.cwd(), 'src'));
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // regex matches `import ... from './something'` and `import './something'`
    const newContent = content.replace(/(import\s+(?:.*?\s+from\s+)?['"])(\.[^'"]+)(['"])/g, (match, p1, p2, p3) => {
        if (!p2.endsWith('.js') && !p2.endsWith('.ts')) {
            return p1 + p2 + '.js' + p3;
        }
        return match;
    });
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        count++;
    }
});

// also fix api/index.ts
let apiContent = fs.readFileSync(path.join(process.cwd(), 'api', 'index.ts'), 'utf8');
let newApiContent = apiContent.replace(/import app from '\.\.\/src\/index';/, "import app from '../src/index.js';");
if (apiContent !== newApiContent) {
    fs.writeFileSync(path.join(process.cwd(), 'api', 'index.ts'), newApiContent, 'utf8');
    count++;
}

console.log(`Updated ${count} files.`);

const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/aadit/OneDrive/Desktop/Hack/agrisense-frontend/src';

const replacements = [
    { from: /bg-slate-50/g, to: 'bg-green-50' },
    { from: /text-slate-900/g, to: 'text-emerald-950' },
    { from: /text-slate-800/g, to: 'text-emerald-900' },
    { from: /text-slate-700/g, to: 'text-emerald-800' },
    { from: /text-slate-600/g, to: 'text-emerald-700' },
    { from: /border-slate-300/g, to: 'border-green-200' },
    { from: /border-slate-200/g, to: 'border-green-200' },
    { from: /bg-slate-200/g, to: 'bg-green-100' },
    { from: /bg-slate-100/g, to: 'bg-green-50' },
    { from: /bg-slate-300/g, to: 'bg-green-200' },
    { from: /via-slate-300/g, to: 'via-green-200' }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.css') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = content;
            for (const { from, to } of replacements) {
                updated = updated.replace(from, to);
            }
            if (updated !== content) {
                fs.writeFileSync(fullPath, updated);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(directoryPath);
console.log('Update complete.');

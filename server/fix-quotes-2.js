const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'controllers');

fs.readdirSync(dir).forEach(f => {
    if (!f.endsWith('.js')) return;
    const fp = path.join(dir, f);
    let content = fs.readFileSync(fp, 'utf8');
    const orig = content;
    
    // Fix instances of '...'datetime('now')'...' -> `...datetime('now')...` or replace outer with double quotes.
    // simpler is to replace ' with ` for all db.prepare lines containing datetime('now')
    // and also fix status = 'active' issues
    
    // We can just find specific lines and replace outer ' with `
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes("db.prepare('") && line.match(/'.*'.*'.*'/)) {
             // If a line has multiple single quotes like:
             // db.prepare('UPDATE enrollments SET status = 'active', enrolled_at = datetime('now') WHERE id = ?')
             // It means it's broken Javascript syntax.
             
             // First extract the query string part.
             let replaced = line.replace(/db\.prepare\('([^]+?)'\)/g, (match, p1) => {
                 // But wait, the parse is already broken. 
                 return match;
             });
        }
    }
});

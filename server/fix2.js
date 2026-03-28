const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'controllers');

fs.readdirSync(dir).forEach(file => {
    if (!file.endsWith('.js')) return;
    const filepath = path.join(dir, file);
    let original = fs.readFileSync(filepath, 'utf8');
    
    // Convert lines like: db.prepare('UPDATE ... = 'active' ...')
    // back to valid JS string by using backticks instead of outer single quotes
    
    let modified = original.split('\n').map(line => {
        if (line.includes("db.prepare('") && (line.includes("'active'") || line.includes("'completed'") || line.includes("datetime('now')") || line.includes("'approved'") || line.includes("'pending'") || line.includes("'cancelled'") || line.includes("'draft'"))) {
            // we have a syntax error line, like:
            // db.prepare('UPDATE enrollments SET status = 'active', enrolled_at = datetime('now') WHERE id = ?')
            // we will replace the first ' after prepare( and the last ' before ) with `
            return line.replace(/db\.prepare\('/, "db.prepare(`").replace(/'\)/, "`)");
        }
        
        // Also fix the multiline ones where they start with db.prepare(' and end with ') on different lines
        return line;
    }).join('\n');
    
    // There were also some SELECT queries that got broken, e.g. 
    // const course = db.prepare('SELECT * FROM courses WHERE id = ? AND status = 'approved'').get(course_id);
    modified = modified.replace(/db\.prepare\('SELECT(.*?)'\)/, (match, inner) => {
        if (inner.includes("'approved'") || inner.includes("'active'")) {
            return "db.prepare(`SELECT" + inner + "`)";
        }
        return match;
    });

    if (original !== modified) {
        fs.writeFileSync(filepath, modified);
        console.log('Fixed syntax in ' + file);
    }
});

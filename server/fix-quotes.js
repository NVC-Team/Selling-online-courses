const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'controllers');

fs.readdirSync(dir).forEach(f => {
    if (!f.endsWith('.js')) return;
    const fp = path.join(dir, f);
    let content = fs.readFileSync(fp, 'utf8');
    const orig = content;
    
    // Fix double-quoted SQL string values to single quotes
    // Pattern: 'SELECT ... WHERE status = "value"' -> "SELECT ... WHERE status = 'value'"
    content = content.replace(/= "approved"/g, "= 'approved'");
    content = content.replace(/= "active"/g, "= 'active'");
    content = content.replace(/= "pending"/g, "= 'pending'");
    content = content.replace(/= "cancelled"/g, "= 'cancelled'");
    content = content.replace(/= "completed"/g, "= 'completed'");
    content = content.replace(/= "draft"/g, "= 'draft'");
    content = content.replace(/datetime\("now"\)/g, "datetime('now')");
    
    if (orig !== content) {
        fs.writeFileSync(fp, content);
        console.log('Fixed:', f);
    }
});

console.log('Done!');

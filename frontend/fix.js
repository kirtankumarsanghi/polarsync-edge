const fs = require('fs'); 
const file = 'src/app/dashboard/page.tsx'; 
let data = fs.readFileSync(file, 'utf8'); 
data = data.replace(/\\`/g, '`').replace(/\\\$\{/g, '${'); 
fs.writeFileSync(file, data);

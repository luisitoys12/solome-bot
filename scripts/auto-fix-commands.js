// ===== AUTO-FIX PARA TODOS LOS COMANDOS =====
// Este script arregla automáticamente TODOS los comandos que tienen problemas

const fs = require('fs');
const path = require('path');

const commandsDir = path.join(__dirname, '../src/commands');
const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));

console.log(`\n🔧 Auto-arreglando ${files.length} comandos...\n`);

let fixed = 0;
let skipped = 0;
let errors = 0;

files.forEach(file => {
    try {
        const filePath = path.join(commandsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // ===== FIX 1: Agregar description a constructor si no existe =====
        if (content.includes('super(client, {') && !content.match(/super\(client,\s*\{[^}]*description:/)) {
            // Extraer el nombre del comando
            const nameMatch = content.match(/name:\s*['"]([^'"]+)['"]/);            if (nameMatch) {
                const cmdName = nameMatch[1];
                // Agregar description después de name
                content = content.replace(
                    /(name:\s*['"][^'"]+['"])/,
                    `$1,\n      description: 'Comando ${cmdName}'`
                );
                modified = true;
            }
        }
        
        // ===== FIX 2: Agregar getSlashCommandData si no existe =====
        if (!content.includes('getSlashCommandData')) {
            // Encontrar el último método de la clase
            const lastMethodMatch = content.match(/}\s*$/m);
            if (lastMethodMatch) {
                const insertion = `

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description || 'Sin descripción'
    }
  }
`;
                // Insertar antes del último }
                content = content.replace(/}\s*$/, insertion + '}');
                modified = true;
            }
        }
        
        // ===== FIX 3: Arreglar getSlashCommandData existente pero incorrecto =====
        if (content.includes('getSlashCommandData()') && 
            content.match(/getSlashCommandData\(\)\s*\{[^}]*return\s*\{[^}]*name:\s*this\.name/)) {
            
            // Verificar si ya tiene description correcta
            if (!content.match(/getSlashCommandData\(\)\s*\{[^}]*return\s*\{[^}]*description:\s*this\.description\s*\|\|/)) {
                content = content.replace(
                    /(getSlashCommandData\(\)\s*\{\s*return\s*\{\s*name:\s*this\.name,?\s*description:\s*)(this\.description)(\s*})/,
                    '$1($2 || \'Sin descripción\')$3'
                );
                modified = true;
            }
        }
        
        // Guardar si se modificó
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${file}`);
            fixed++;
        } else {
            console.log(`⏭️  ${file} (sin cambios necesarios)`);
            skipped++;
        }
        
    } catch (error) {
        console.log(`❌ ${file}: ${error.message}`);
        errors++;
    }
});

console.log(`\n${'='.repeat(80)}`);
console.log(`\n📊 RESULTADOS:\n`);
console.log(`✅ Archivos arreglados: ${fixed}`);
console.log(`⏭️  Sin cambios: ${skipped}`);
console.log(`❌ Errores: ${errors}`);
console.log(`📁 Total: ${files.length}\n`);

if (fixed > 0) {
    console.log(`🎉 ¡${fixed} comandos fueron arreglados!\n`);
    console.log(`🔄 Ahora ejecuta: node scripts/fix-commands.js\n`);
} else {
    console.log(`✨ No se necesitaron cambios\n`);
}

process.exit(errors > 0 ? 1 : 0);

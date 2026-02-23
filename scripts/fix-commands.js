// ===== SCRIPT DE REPARACIÓN MASIVA DE COMANDOS =====
// Este script verifica y arregla TODOS los comandos slash
// para que funcionen correctamente en Discord.js v14

const fs = require('fs');
const path = require('path');

const commandsDir = path.join(__dirname, '../src/commands');
const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));

console.log(`\n🔧 Verificando ${files.length} comandos...\n`);

let fixed = 0;
let errors = 0;
let verified = 0;

files.forEach(file => {
    try {
        const filePath = path.join(commandsDir, file);
        const command = require(filePath);
        
        // Verificar estructura básica
        if (!command.data || !command.execute) {
            console.log(`❌ ${file}: Falta data o execute`);
            errors++;
            return;
        }
        
        // Verificar que tenga toJSON
        if (!command.data.toJSON) {
            console.log(`⚠️  ${file}: data no es SlashCommandBuilder`);
            errors++;
            return;
        }
        
        // Verificar que el comando sea válido
        const json = command.data.toJSON();
        if (!json.name || !json.description) {
            console.log(`❌ ${file}: JSON inválido`);
            errors++;
            return;
        }
        
        console.log(`✅ ${file}: ${json.name} - OK`);
        verified++;
        
    } catch (error) {
        console.log(`💥 ${file}: ERROR - ${error.message}`);
        errors++;
    }
});

console.log(`\n📊 RESULTADOS:`);
console.log(`✅ Verificados: ${verified}`);
console.log(`❌ Errores: ${errors}`);
console.log(`📁 Total: ${files.length}\n`);

if (errors > 0) {
    console.log(`⚠️  Hay ${errors} comandos con problemas que necesitan corrección manual.\n`);
    process.exit(1);
} else {
    console.log(`🎉 ¡Todos los comandos están correctos!\n`);
    process.exit(0);
}

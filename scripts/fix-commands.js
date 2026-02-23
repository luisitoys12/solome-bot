// ===== VERIFICADOR CORRECTO PARA COMANDOS CON CLASES =====
const fs = require('fs');
const path = require('path');

// Mock client simple
const mockClient = {
    ws: { ping: 50 },
    user: { tag: 'SOLOME#0000', id: '123' },
    guilds: { cache: { size: 10 } },
    users: { cache: { size: 100 } },
    slashCommands: new Map(),
    commands: new Map(),
    log: () => {}
};

const commandsDir = path.join(__dirname, '../src/commands');
const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));

console.log(`\n🔧 Verificando ${files.length} comandos...\n`);

let verified = 0;
let errors = [];
let warnings = [];

files.forEach(file => {
    try {
        const filePath = path.join(commandsDir, file);
        
        // Limpiar cache
        delete require.cache[require.resolve(filePath)];
        
        const CommandClass = require(filePath);
        
        // Verificar que sea una clase/función
        if (typeof CommandClass !== 'function') {
            errors.push(`${file}: No exporta una clase`);
            return;
        }
        
        // Instanciar comando
        let commandInstance;
        try {
            commandInstance = new CommandClass(mockClient);
        } catch (e) {
            errors.push(`${file}: Error al instanciar - ${e.message}`);
            return;
        }
        
        // Verificar propiedades básicas
        if (!commandInstance.name) {
            errors.push(`${file}: No tiene propiedad 'name'`);
            return;
        }
        
        // Verificar métodos necesarios
        const hasGetSlashCommandData = typeof commandInstance.getSlashCommandData === 'function';
        const hasRunSlash = typeof commandInstance.runSlash === 'function';
        
        if (!hasGetSlashCommandData) {
            errors.push(`${file}: Falta método getSlashCommandData()`);
            return;
        }
        
        if (!hasRunSlash) {
            errors.push(`${file}: Falta método runSlash()`);
            return;
        }
        
        // Verificar que getSlashCommandData retorne algo válido
        let slashData;
        try {
            slashData = commandInstance.getSlashCommandData();
        } catch (e) {
            errors.push(`${file}: Error en getSlashCommandData() - ${e.message}`);
            return;
        }
        
        if (!slashData || typeof slashData !== 'object') {
            errors.push(`${file}: getSlashCommandData() no retorna un objeto`);
            return;
        }
        
        if (!slashData.name) {
            errors.push(`${file}: getSlashCommandData() no tiene 'name'`);
            return;
        }
        
        if (!slashData.description) {
            errors.push(`${file}: getSlashCommandData() no tiene 'description'`);
            return;
        }
        
        // Validar nombre de comando
        if (!/^[a-z0-9_-]{1,32}$/.test(slashData.name)) {
            errors.push(`${file}: Nombre inválido '${slashData.name}' (debe ser minúsculas, sin espacios, 1-32 caracteres)`);
            return;
        }
        
        // Validar descripción
        if (typeof slashData.description !== 'string' || slashData.description.trim().length === 0) {
            errors.push(`${file}: Descripción vacía o inválida`);
            return;
        }
        
        // Todo OK
        console.log(`✅ ${file.padEnd(25)} -> /${slashData.name.padEnd(20)} | ${slashData.description.substring(0, 50)}`);
        verified++;
        
    } catch (error) {
        errors.push(`${file}: Excepción - ${error.message}`);
    }
});

console.log(`\n${'='.repeat(80)}`);
console.log(`\n📊 RESULTADOS:\n`);
console.log(`✅ Comandos verificados correctamente: ${verified}`);
console.log(`❌ Comandos con errores: ${errors.length}`);
console.log(`📁 Total de archivos: ${files.length}\n`);

if (errors.length > 0) {
    console.log(`🚨 ERRORES ENCONTRADOS:\n`);
    errors.forEach(err => console.log(`   ❌ ${err}`));
    console.log(`\n🛠️  Revisa el archivo FIX_COMANDOS_README.md para soluciones\n`);
    process.exit(1);
} else {
    console.log(`🎉 ¡TODOS LOS COMANDOS ESTÁN CORRECTOS!\n`);
    console.log(`🚀 Los ${verified} comandos se registrarán automáticamente al iniciar el bot.\n`);
    process.exit(0);
}

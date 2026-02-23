# 🛠️ Requisitos del Sistema para SOLOME Bot

## 💻 Requisitos de Software

### 1. **Node.js y npm**
```bash
# Verificar versión (debe ser >=20.0.0)
node --version
npm --version

# Si no está instalado o es versión antigua:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. **yt-dlp** (Para comando /download)
```bash
# Instalar yt-dlp
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# Verificar instalación
yt-dlp --version

# Actualizar yt-dlp (recomendado cada mes)
sudo yt-dlp -U
```

### 3. **FFmpeg** (Para procesamiento de audio/video)
```bash
# Instalar FFmpeg
sudo apt update
sudo apt install -y ffmpeg

# Verificar instalación
ffmpeg -version
```

### 4. **Python 3** (Dependencia de yt-dlp)
```bash
# Instalar Python 3
sudo apt install -y python3 python3-pip

# Verificar
python3 --version
```

---

## 🚀 Instalación Rápida (Todo en uno)

```bash
# Ejecutar este script para instalar TODO de una vez
sudo apt update && sudo apt upgrade -y

# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# FFmpeg
sudo apt install -y ffmpeg

# Python 3
sudo apt install -y python3 python3-pip

# yt-dlp
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# PM2 (gestor de procesos)
sudo npm install -g pm2

# Verificar todo
echo "=== Verificando instalación ==="
node --version
npm --version
ffmpeg -version | head -n 1
python3 --version
yt-dlp --version
pm2 --version
```

---

## ✅ Verificar que TODO esté instalado

```bash
# Ejecutar este comando para verificar
cd ~/solome-bot
node -e "
const { exec } = require('child_process');
const checks = [
  ['node --version', 'Node.js'],
  ['npm --version', 'npm'],
  ['ffmpeg -version', 'FFmpeg'],
  ['python3 --version', 'Python 3'],
  ['yt-dlp --version', 'yt-dlp'],
  ['pm2 --version', 'PM2']
];

checks.forEach(([cmd, name]) => {
  exec(cmd, (error) => {
    console.log(error ? '❌ ' + name + ' - NO INSTALADO' : '✅ ' + name + ' - OK');
  });
});
"
```

---

## 💻 Comandos que requieren cada herramienta

| Herramienta | Comandos que la usan |
|------------|---------------------|
| **yt-dlp** | `/download` |
| **FFmpeg** | `/download`, `/play`, `/radio`, `/music` |
| **Python 3** | `/ai` (si usa APIs de Python), comandos con yt-dlp |

---

## 🔄 Mantenimiento

### Actualizar yt-dlp (recomendado mensualmente)
```bash
sudo yt-dlp -U
```

### Actualizar Node.js
```bash
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
```

### Actualizar dependencias del bot
```bash
cd ~/solome-bot
git pull
npm install
npm audit fix
pm2 restart solome-bot
```

---

## ⚠️ Troubleshooting

### Error: "yt-dlp: command not found"
```bash
# Reinstalar yt-dlp
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### Error: "ffmpeg: command not found"
```bash
sudo apt update
sudo apt install -y ffmpeg
```

### Error: "Status code: 410" en YouTube
```bash
# Actualizar yt-dlp a la última versión
sudo yt-dlp -U
```

---

## 🎉 Listo!

Si todos los checks muestran ✅, tu servidor está listo para ejecutar SOLOME Bot con todas sus funciones.

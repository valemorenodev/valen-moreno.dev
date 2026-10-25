
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = [
  path.resolve(__dirname, '../src/data/content.es.json'),
  path.resolve(__dirname, '../src/data/content.en.json'),
];

function getErrorLocation(error, content) {
  const positionMatch = error.message.match(/position\s+(\d+)/i);

  if (positionMatch) {
    const position = Number(positionMatch[1]);
    const beforeError = content.slice(0, position);
    const line = beforeError.split('\n').length;
    const lastNewline = beforeError.lastIndexOf('\n');
    const column = position - lastNewline;

    return { line, column };
  }

  const lineMatch = error.message.match(/line\s+(\d+)\s+column\s+(\d+)/i);

  if (lineMatch) {
    return {
      line: Number(lineMatch[1]),
      column: Number(lineMatch[2]),
    };
  }

  return null;
}

function validateJson(filePath) {
  const fileName = path.basename(filePath);

  if (!fs.existsSync(filePath)) {
    console.error(`\n❌ No se encontró el archivo: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  try {
    JSON.parse(content);
    console.log(`✅ ${fileName}: JSON válido`);
    return true;
  } catch (error) {
    const location = getErrorLocation(error, content);

    console.error(`\n❌ Error de sintaxis en ${fileName}`);
    console.error(`   ${error.message}`);

    if (location) {
      const lines = content.split(/\r?\n/);
      const sourceLine = lines[location.line - 1] ?? '';

      console.error(
        `\n📍 Línea ${location.line}, columna ${location.column}`,
      );
      console.error(`   ${location.line} | ${sourceLine}`);
      console.error(
        `   ${' '.repeat(String(location.line).length)} | ` +
        `${' '.repeat(Math.max(0, location.column - 1))}^`,
      );
    } else {
      console.error(
        'No fue posible determinar la ubicación exacta con este mensaje de error.',
      );
    }

    return false;
  }
}

const results = files.map(validateJson);
const hasErrors = results.some((isValid) => !isValid);

if (hasErrors) {
  console.error('\n🚫 Validación fallida. Corrige los archivos JSON antes de continuar.');
  process.exitCode = 1;
} else {
  console.log('\n✨ Todos los archivos de traducción son válidos.');
}
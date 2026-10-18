// Verifica que docs/**/*.feature y los specs no se desincronicen:
// - cada escenario @TC-XX de un .feature tiene su test, y viceversa;
// - cada caso tiene los mismos tags en el doc y en el test (capa, módulo,
//   tipo de prueba y @known-defect), así el .feature dice la verdad sobre
//   qué corre en cada `--grep`;
// - cada test tiene un @TC-XX y al menos un tag de suite (si no, ningún
//   `--grep` de CI lo selecciona y solo corre con `npm test`).
// Los .feature no se ejecutan (no hay Cucumber), así que sin este chequeo
// nada impide que la documentación y el código diverjan en silencio.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SUITE_TAGS = ['@smoke', '@regression', '@negative'];
const TC_ID = /^@TC-[A-Z0-9]+-\d+$/;

const sameTags = (a, b) => a.size === b.size && [...a].every((t) => b.has(t));
const format = (tags) => [...tags].sort().join(' ');

// Parser mínimo de Gherkin: solo interesan los tags y a qué bloque
// (Feature, Scenario, Examples) se aplican. Los tags del Feature se heredan
// en cada escenario y los de Examples se suman a su Scenario Outline, igual
// que en Cucumber.
function parseFeature(file) {
  const scenarios = [];
  let pending = [];
  let featureTags = [];
  let current = null;
  for (const line of readFileSync(file, 'utf-8')
    .split('\n')
    .map((l) => l.trim())) {
    if (line.startsWith('@')) {
      pending.push(...line.split(/\s+/));
      continue;
    }
    if (line.startsWith('Feature:')) {
      featureTags = pending;
    } else if (/^Scenario( Outline)?:/.test(line)) {
      current = { file, title: line, tags: new Set([...featureTags, ...pending]) };
      scenarios.push(current);
    } else if (line.startsWith('Examples') && current) {
      for (const tag of pending) current.tags.add(tag);
    } else {
      continue;
    }
    pending = [];
  }
  return scenarios;
}

const featureFiles = readdirSync('docs', { recursive: true })
  .filter((f) => f.endsWith('.feature'))
  .map((f) => join('docs', f));

const errors = new Set();
const docCases = new Map();
for (const scenario of featureFiles.flatMap(parseFeature)) {
  const ids = [...scenario.tags].filter((t) => TC_ID.test(t));
  if (ids.length !== 1) {
    errors.add(`Escenario con ${ids.length} @TC-XX (debe tener 1): ${scenario.file} "${scenario.title}"`);
    continue;
  }
  if (docCases.has(ids[0])) errors.add(`${ids[0]} está duplicado en docs: ${scenario.file}`);
  docCases.set(ids[0], scenario.tags);
}

// --list usa el mismo parser de Playwright: los tags salen del título y
// del describe tal como los ve `--grep`, incluidos los generados dinámicamente.
const report = JSON.parse(
  execFileSync('npx', ['playwright', 'test', '--list', '--reporter=json'], { encoding: 'utf-8' })
);

const specs = [];
const collect = (suite) => {
  for (const spec of suite.specs ?? []) specs.push(spec);
  for (const child of suite.suites ?? []) collect(child);
};
report.suites.forEach(collect);

// Un mismo @TC-XX puede automatizarse con varios tests (ej. un test por fila
// de Examples): se compara la unión de sus tags con la del escenario.
const testCases = new Map();
for (const spec of specs) {
  if (spec.file.startsWith('setup/')) continue;
  const where = `tests/${spec.file}:${spec.line} "${spec.title}"`;
  const tags = spec.tags.map((t) => `@${t}`);
  const ids = tags.filter((t) => TC_ID.test(t));

  if (ids.length !== 1) errors.add(`Test con ${ids.length} @TC-XX (debe tener 1): ${where}`);
  if (!tags.some((t) => SUITE_TAGS.includes(t))) {
    errors.add(`Test sin tag de suite (${SUITE_TAGS.join('/')}): ${where}`);
  }
  for (const id of ids) {
    if (!testCases.has(id)) testCases.set(id, new Set());
    for (const tag of tags) testCases.get(id).add(tag);
  }
}

for (const [id, testTags] of testCases) {
  const docTags = docCases.get(id);
  if (!docTags) {
    errors.add(`${id} tiene test pero no está documentado en docs/**/*.feature`);
  } else if (!sameTags(docTags, testTags)) {
    errors.add(`${id} tiene tags distintos -> doc: ${format(docTags)} | test: ${format(testTags)}`);
  }
}
for (const id of docCases.keys()) {
  if (!testCases.has(id)) errors.add(`${id} está en docs/**/*.feature pero no tiene test`);
}

if (errors.size > 0) {
  console.error(`Trazabilidad rota (${errors.size}):\n- ${[...errors].join('\n- ')}`);
  process.exit(1);
}
console.log(`Trazabilidad OK: ${docCases.size} casos documentados, automatizados y con los mismos tags.`);

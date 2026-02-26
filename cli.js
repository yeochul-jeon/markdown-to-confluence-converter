'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseArgs } = require('node:util');

const ConfluenceConverter = require('./js/converter.js');

// CLI 옵션 정의
const options = {
  help: { type: 'boolean', short: 'h', default: false },
  output: { type: 'string', short: 'o' },
  recursive: { type: 'boolean', short: 'r', default: false },
  stdout: { type: 'boolean', default: false },
  theme: { type: 'string', short: 't' },
};

function printHelp() {
  console.log(`
사용법: md2confluence [옵션] <파일|디렉토리...>

마크다운 파일을 Confluence 위키 마크업으로 변환합니다.

인자:
  <파일|디렉토리...>    변환할 .md 파일 또는 디렉토리

옵션:
  -h, --help           도움말 출력
  -o, --output <경로>  출력 디렉토리 (기본: 입력 파일과 같은 위치)
  -r, --recursive      디렉토리 하위까지 재귀 탐색
  -t, --theme <테마>   코드 블록 테마 (예: Midnight, RDark)
  --stdout             결과를 stdout으로 출력 (파일 미생성)

예시:
  md2confluence README.md                    # README.wiki 생성
  md2confluence -o output/ docs/*.md         # output/ 디렉토리에 출력
  md2confluence -r docs/                     # docs/ 하위 재귀 변환
  cat README.md | md2confluence              # stdin → stdout
  echo "# Hello" | md2confluence --stdout    # stdin → stdout
`.trim());
}

// .md 파일을 재귀적으로 수집
function collectMarkdownFiles(target, recursive) {
  const stat = fs.statSync(target);

  if (stat.isFile()) {
    if (target.endsWith('.md')) return [target];
    console.error(`경고: ${target}은(는) .md 파일이 아닙니다. 건너뜁니다.`);
    return [];
  }

  if (stat.isDirectory()) {
    const entries = fs.readdirSync(target, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      const full = path.join(target, entry.name);
      if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(full);
      } else if (entry.isDirectory() && recursive) {
        files = files.concat(collectMarkdownFiles(full, recursive));
      }
    }
    return files;
  }

  return [];
}

// 출력 경로 계산
function getOutputPath(inputPath, outputDir) {
  const ext = path.extname(inputPath);
  const base = path.basename(inputPath, ext) + '.wiki';

  if (outputDir) {
    return path.join(outputDir, base);
  }
  return path.join(path.dirname(inputPath), base);
}

// 단일 파일 변환
function convertFile(inputPath, outputDir, opts) {
  const markdown = fs.readFileSync(inputPath, 'utf-8');
  const result = ConfluenceConverter.convert(markdown, { theme: opts.theme || '' });

  if (opts.stdout) {
    process.stdout.write(result);
    return;
  }

  const outPath = getOutputPath(inputPath, outputDir);

  // 출력 디렉토리 생성
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, result, 'utf-8');
  console.log(`${inputPath} → ${outPath}`);
}

// stdin 읽기
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs({ options, allowPositionals: true, strict: true });
  } catch (err) {
    console.error(`오류: ${err.message}`);
    printHelp();
    process.exit(1);
  }

  const { values, positionals } = parsed;

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  // stdin 모드: 인자 없고 TTY가 아닌 경우
  if (positionals.length === 0) {
    if (process.stdin.isTTY) {
      printHelp();
      process.exit(1);
    }

    const markdown = await readStdin();
    const result = ConfluenceConverter.convert(markdown, { theme: values.theme || '' });
    process.stdout.write(result);
    return;
  }

  // 파일/디렉토리 모드
  const outputDir = values.output || null;

  // 출력 디렉토리 생성
  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let totalFiles = 0;

  for (const target of positionals) {
    if (!fs.existsSync(target)) {
      console.error(`오류: ${target}을(를) 찾을 수 없습니다.`);
      process.exit(1);
    }

    const files = collectMarkdownFiles(target, values.recursive);

    for (const file of files) {
      convertFile(file, outputDir, values);
      totalFiles++;
    }
  }

  if (totalFiles === 0) {
    console.error('변환할 .md 파일을 찾지 못했습니다.');
    process.exit(1);
  }

  if (!values.stdout && totalFiles > 1) {
    console.log(`\n총 ${totalFiles}개 파일 변환 완료.`);
  }
}

main().catch(err => {
  console.error(`오류: ${err.message}`);
  process.exit(1);
});

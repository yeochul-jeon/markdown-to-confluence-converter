/**
 * UI 로직 및 이벤트 핸들러
 */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // === DOM 요소 ===
  const inputEl = document.getElementById('markdown-input');
  const outputEl = document.getElementById('confluence-output');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileName = document.getElementById('file-name');
  const fileRemove = document.getElementById('file-remove');
  const codeThemeEl = document.getElementById('code-theme');
  const templateGrid = document.getElementById('template-grid');
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  // === 테마 토글 ===
  const themeToggle = document.getElementById('theme-toggle');

  function applyTheme(dark) {
    document.body.classList.toggle('dark-theme', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  // 저장된 테마 복원 (없으면 시스템 설정 따르기)
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme === 'dark');
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme(true);
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    applyTheme(!isDark);
  });

  // === 디바운스 ===
  let debounceTimer = null;
  function debounce(fn, delay) {
    return function (...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // === 변환 실행 ===
  function runConvert() {
    const md = inputEl.value;
    const theme = codeThemeEl.value;
    outputEl.value = ConfluenceConverter.convert(md, { theme });
  }

  const debouncedConvert = debounce(runConvert, 200);

  // === Toast 알림 ===
  let toastEl = null;
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.add('toast--visible');
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('toast--visible');
    }, 2000);
  }

  // === 실시간 변환 ===
  inputEl.addEventListener('input', debouncedConvert);

  // === 테마 변경 시 재변환 ===
  codeThemeEl.addEventListener('change', runConvert);

  // === Clear ===
  btnClear.addEventListener('click', () => {
    inputEl.value = '';
    outputEl.value = '';
    // 파일 정보도 초기화
    fileInfo.classList.add('hidden');
    fileInput.value = '';
  });

  // === 복사 (Clipboard API + fallback) ===
  btnCopy.addEventListener('click', async () => {
    const text = outputEl.value;
    if (!text) {
      showToast('변환할 내용이 없습니다');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('클립보드에 복사되었습니다');
    } catch {
      // fallback
      outputEl.select();
      document.execCommand('copy');
      showToast('클립보드에 복사되었습니다');
    }

    // 버튼 피드백
    const original = btnCopy.textContent;
    btnCopy.textContent = 'Copied!';
    btnCopy.classList.add('btn--success');
    setTimeout(() => {
      btnCopy.textContent = original;
      btnCopy.classList.remove('btn--success');
    }, 1500);
  });

  // === 다운로드 ===
  btnDownload.addEventListener('click', () => {
    const text = outputEl.value;
    if (!text) {
      showToast('다운로드할 내용이 없습니다');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'confluence-markup.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('파일이 다운로드되었습니다');
  });

  // === 탭 전환 ===
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('tab--active'));
      tabContents.forEach(tc => tc.classList.remove('tab-content--active'));
      tab.classList.add('tab--active');
      document.querySelector(`[data-tab-content="${target}"]`).classList.add('tab-content--active');
    });
  });

  // === 파일 업로드 ===
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
  const ALLOWED_EXTENSIONS = ['.md', '.markdown', '.txt'];

  function validateFile(file) {
    if (file.size > MAX_FILE_SIZE) {
      showToast('파일 크기가 1MB를 초과합니다');
      return false;
    }
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      showToast('지원하지 않는 파일 형식입니다 (.md, .markdown, .txt)');
      return false;
    }
    return true;
  }

  function handleFile(file) {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      inputEl.value = e.target.result;
      runConvert();
      fileName.textContent = file.name;
      fileInfo.classList.remove('hidden');

      // 텍스트 입력 탭으로 전환
      tabs.forEach(t => t.classList.remove('tab--active'));
      tabContents.forEach(tc => tc.classList.remove('tab-content--active'));
      document.querySelector('[data-tab="text"]').classList.add('tab--active');
      document.querySelector('[data-tab-content="text"]').classList.add('tab-content--active');
    };
    reader.readAsText(file);
  }

  // 드래그&드롭
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drop-zone--dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drop-zone--dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drop-zone--dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // 클릭으로 파일 선택
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  // 파일 제거
  fileRemove.addEventListener('click', () => {
    fileInfo.classList.add('hidden');
    fileInput.value = '';
  });

  // === 템플릿 렌더링 ===
  function renderTemplates() {
    const templates = Templates.getAll();
    templateGrid.innerHTML = templates.map(t => `
      <div class="template-card" data-template-id="${t.id}">
        <div class="template-card__icon">${t.icon}</div>
        <div class="template-card__name">${t.name}</div>
        <div class="template-card__desc">${t.desc}</div>
      </div>
    `).join('');

    // 카드 클릭 이벤트
    templateGrid.querySelectorAll('.template-card').forEach(card => {
      card.addEventListener('click', () => {
        const template = Templates.getById(card.dataset.templateId);
        if (template) {
          inputEl.value = template.content;
          runConvert();

          // 텍스트 입력 탭으로 전환
          tabs.forEach(t => t.classList.remove('tab--active'));
          tabContents.forEach(tc => tc.classList.remove('tab-content--active'));
          document.querySelector('[data-tab="text"]').classList.add('tab--active');
          document.querySelector('[data-tab-content="text"]').classList.add('tab-content--active');

          // 상단으로 스크롤
          inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          showToast(`"${template.name}" 템플릿이 로드되었습니다`);
        }
      });
    });
  }

  // === 초기화 ===
  renderTemplates();
});

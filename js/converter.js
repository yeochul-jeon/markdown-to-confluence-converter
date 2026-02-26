/**
 * Markdown → Confluence Wiki Markup 변환 엔진
 * marked.js v15 커스텀 렌더러 기반
 * UMD: 브라우저(글로벌 marked) / Node.js(require) 듀얼 지원
 */
;(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const { marked } = require('marked');
    module.exports = factory(marked);
  } else {
    root.ConfluenceConverter = factory(root.marked);
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function (marked) {
  'use strict';

  /**
   * 리스트 중첩 접두사를 사전 계산하는 walkTokens 훅
   * ordered list → '#', unordered list → '*'
   */
  function walkTokensFn(token) {
    if (token.type === 'list') {
      const marker = token.ordered ? '#' : '*';
      const parentPrefix = token._parentPrefix || '';
      const prefix = parentPrefix + marker;

      if (token.items) {
        token.items.forEach(item => {
          item._fullPrefix = prefix;
          // 하위 토큰에 부모 접두사 전파
          if (item.tokens) {
            item.tokens.forEach(child => {
              if (child.type === 'list') {
                child._parentPrefix = prefix;
              }
            });
          }
        });
      }
    }
  }

  /**
   * 마크다운을 Confluence 위키 마크업으로 변환
   */
  function convert(markdown, options = {}) {
    if (!markdown || !markdown.trim()) {
      return '';
    }

    const theme = options.theme || '';

    const renderer = {
      // === 인라인 렌더러 ===

      strong({ tokens }) {
        return `*${this.parser.parseInline(tokens)}*`;
      },

      em({ tokens }) {
        return `_${this.parser.parseInline(tokens)}_`;
      },

      del({ tokens }) {
        return `-${this.parser.parseInline(tokens)}-`;
      },

      codespan({ text }) {
        const escaped = text
          .replace(/\\/g, '\\\\')
          .replace(/\{/g, '\\{')
          .replace(/\}/g, '\\}');
        return `\x00CS\x00${escaped}\x00CE\x00`;
      },

      link({ href, tokens }) {
        const text = this.parser.parseInline(tokens);
        if (text && text !== href) {
          return `[${text}|${href}]`;
        }
        return `[${href}]`;
      },

      image({ href, text }) {
        if (text) {
          return `!${href}|alt=${text}!`;
        }
        return `!${href}!`;
      },

      br() {
        return '\n';
      },

      text({ text, tokens }) {
        if (tokens) {
          return this.parser.parseInline(tokens);
        }
        return text.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
      },

      // === 블록 렌더러 ===

      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        return `h${depth}. ${text}\n\n`;
      },

      paragraph({ tokens }) {
        const text = this.parser.parseInline(tokens);
        return `${text}\n\n`;
      },

      blockquote({ tokens }) {
        const inner = this.parser.parse(tokens).replace(/^\n+|\n+$/g, '').trim();
        return `{quote}\n${inner}\n{quote}\n\n`;
      },

      code({ text, lang }) {
        const params = [];
        const isMermaid = lang === 'mermaid';
        if (lang) params.push(`language=${isMermaid ? 'text' : lang}`);
        if (isMermaid) {
          params.push('title=mermaid');
          params.push('collapse=true');
        }
        if (theme) params.push(`theme=${theme}`);
        const paramStr = params.length > 0 ? `:${params.join('|')}` : '';
        return `{code${paramStr}}\n${text}\n{code}\n\n`;
      },

      hr() {
        return '----\n\n';
      },

      // === 리스트 렌더러 ===

      list(token) {
        let body = '';
        for (const item of token.items) {
          body += this.listitem(item);
        }
        return `${body}\n`;
      },

      listitem(item) {
        const prefix = item._fullPrefix || '*';

        // 텍스트 토큰과 하위 리스트 토큰 분리
        const inlineTokens = [];
        const subListTokens = [];

        for (const child of item.tokens) {
          if (child.type === 'list') {
            subListTokens.push(child);
          } else {
            inlineTokens.push(child);
          }
        }

        // 인라인 텍스트 렌더링
        let text = this.parser.parse(inlineTokens).replace(/^\n+|\n+$/g, '').trim();

        // 체크박스(task) 처리 - checkbox 렌더러가 이미 마커를 텍스트에 포함
        if (item.task) {
          let result = `${prefix} ${text}\n`;
          // 하위 리스트 추가
          for (const sub of subListTokens) {
            result += this.list(sub);
          }
          return result;
        }

        let result = `${prefix} ${text}\n`;
        // 하위 리스트 추가
        for (const sub of subListTokens) {
          result += this.list(sub);
        }
        return result;
      },

      // === 테이블 렌더러 ===

      table(token) {
        let result = '';

        // 헤더 행
        if (token.header && token.header.length > 0) {
          const headerCells = token.header.map(cell =>
            this.parser.parseInline(cell.tokens)
          ).join(' || ');
          result += `|| ${headerCells} ||\n`;
        }

        // 본문 행
        if (token.rows && token.rows.length > 0) {
          for (const row of token.rows) {
            const cells = row.map(cell =>
              this.parser.parseInline(cell.tokens)
            ).join(' | ');
            result += `| ${cells} |\n`;
          }
        }

        return result + '\n';
      },

      tablerow({ text }) {
        return text;
      },

      tablecell(token) {
        return this.parser.parseInline(token.tokens);
      },

      checkbox({ checked }) {
        return checked ? '(/) ' : '(x) ';
      }
    };

    marked.use({
      renderer,
      walkTokens: walkTokensFn,
      gfm: true,
      breaks: false
    });

    const raw = marked.parse(markdown);
    return postProcess(raw);
  }

  /**
   * 후처리: 변환 결과 정리
   */
  function postProcess(text) {
    // {code} 블록 내부를 보호하면서 후처리
    const codeBlocks = [];
    let processed = text.replace(/\{code(?::[^}]*)?\}[\s\S]*?\{code\}/g, match => {
      codeBlocks.push(match);
      return `\x00CODE_BLOCK_${codeBlocks.length - 1}\x00`;
    });

    processed = processed
      // marked.js가 파싱하지 못한 잔여 **bold** → *bold* 변환
      .replace(/\*\*(.+?)\*\*/g, '*$1*')
      // 연속 3개 이상 빈 줄을 2개로
      .replace(/\n{3,}/g, '\n\n');

    // {code} 블록 복원
    processed = processed.replace(/\x00CODE_BLOCK_(\d+)\x00/g, (_, idx) => {
      return codeBlocks[parseInt(idx)];
    });

    // 인라인 코드(codespan) 플레이스홀더 복원
    processed = processed
      .replace(/\x00CS\x00/g, '{{')
      .replace(/\x00CE\x00/g, '}}');

    return processed.trim() + '\n';
  }

  return { convert };
}));

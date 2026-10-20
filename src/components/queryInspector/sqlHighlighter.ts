// High-performance SQL syntax highlighter and formatter for DBMS Inspector

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'NOT IN',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'ON',
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'BEGIN', 'TRANSACTION', 'ISOLATION', 'LEVEL', 'READ', 'COMMITTED', 'SERIALIZABLE',
  'COMMIT', 'ROLLBACK', 'FOR', 'UPDATE', 'TABLE', 'CREATE', 'ALTER', 'DROP',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'INDEX', 'UNIQUE', 'CASCADE',
  'DENSE_RANK', 'OVER', 'SUM', 'COUNT', 'AVG', 'MIN', 'MAX', 'AS',
  'CURRENT_DATE', 'NOW', 'INTERVAL', 'ILIKE', 'LIKE', 'NULL', 'IS', 'TRUE', 'FALSE',
  'UNION', 'ALL', 'EXPLAIN', 'ANALYZE', 'PARTITION'
]);

export interface HighlightToken {
  text: string;
  type: 'keyword' | 'string' | 'number' | 'comment' | 'operator' | 'punctuation' | 'identifier' | 'whitespace';
}

export function tokenizeSql(sql: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let i = 0;
  const len = sql.length;

  while (i < len) {
    const char = sql[i];

    // Whitespace / Newlines
    if (/\s/.test(char)) {
      let space = '';
      while (i < len && /\s/.test(sql[i])) {
        space += sql[i];
        i++;
      }
      tokens.push({ text: space, type: 'whitespace' });
      continue;
    }

    // Line comment -- ...
    if (char === '-' && i + 1 < len && sql[i + 1] === '-') {
      let comment = '';
      while (i < len && sql[i] !== '\n') {
        comment += sql[i];
        i++;
      }
      tokens.push({ text: comment, type: 'comment' });
      continue;
    }

    // Strings '...'
    if (char === "'") {
      let str = "'";
      i++;
      while (i < len) {
        if (sql[i] === "'") {
          str += "'";
          i++;
          if (i < len && sql[i] === "'") {
            str += "'";
            i++;
          } else {
            break;
          }
        } else {
          str += sql[i];
          i++;
        }
      }
      tokens.push({ text: str, type: 'string' });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(char) || (char === '.' && i + 1 < len && /[0-9]/.test(sql[i + 1]))) {
      let num = '';
      while (i < len && /[0-9.eE+-]/.test(sql[i])) {
        num += sql[i];
        i++;
      }
      tokens.push({ text: num, type: 'number' });
      continue;
    }

    // Identifiers and Keywords
    if (/[a-zA-Z_]/.test(char)) {
      let word = '';
      while (i < len && /[a-zA-Z0-9_]/.test(sql[i])) {
        word += sql[i];
        i++;
      }
      const upper = word.toUpperCase();
      if (SQL_KEYWORDS.has(upper)) {
        tokens.push({ text: word, type: 'keyword' });
      } else {
        tokens.push({ text: word, type: 'identifier' });
      }
      continue;
    }

    // Punctuation and Operators
    if (/[(),;]/.test(char)) {
      tokens.push({ text: char, type: 'punctuation' });
      i++;
      continue;
    }

    if (/[=<>!+\-*/%]/.test(char)) {
      let op = char;
      i++;
      while (i < len && /[=<>!+\-*/%]/.test(sql[i])) {
        op += sql[i];
        i++;
      }
      tokens.push({ text: op, type: 'operator' });
      continue;
    }

    // Catch-all
    tokens.push({ text: char, type: 'whitespace' });
    i++;
  }

  return tokens;
}

import React, { useState, useMemo } from 'react';
import { useQueryInspector, DBMS_PRESET_QUERIES } from '../../context/QueryInspectorContext';
import { tokenizeSql } from './sqlHighlighter';
import { QueryRecord } from '../../types/queryInspector';
import {
  Database,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Download,
  Search,
  Copy,
  Check,
  Play,
  Layers,
  Sparkles,
  ShieldCheck,
  Clock,
  Terminal,
  Activity
} from 'lucide-react';

export const QueryInspectorChatbox: React.FC = () => {
  const {
    queries,
    isOpen,
    setIsOpen,
    dockMode,
    toggleDockMode,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    clearQueries,
    executePresetQuery,
    exportSqlScript,
    totalQueriesCount
  } = useQueryInspector();

  const [activeTab, setActiveTab] = useState<'stream' | 'presets'>('stream');
  const [copiedQueryId, setCopiedQueryId] = useState<string | null>(null);

  const handleCopySql = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedQueryId(id);
    setTimeout(() => {
      setCopiedQueryId(null);
    }, 2000);
  };

  // Filter queries by type and search term
  const filteredQueries = useMemo(() => {
    return queries.filter(q => {
      const matchesFilter = activeFilter === 'ALL' || q.type === activeFilter;
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        q.sql.toLowerCase().includes(term) ||
        q.sourceButton.toLowerCase().includes(term) ||
        q.primaryTable.toLowerCase().includes(term) ||
        (q.pageContext && q.pageContext.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [queries, activeFilter, searchQuery]);

  // Counts by type for badge chips
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: queries.length, SELECT: 0, INSERT: 0, UPDATE: 0, DELETE: 0, TRANSACTION: 0 };
    queries.forEach(q => {
      if (c[q.type] !== undefined) {
        c[q.type]++;
      }
    });
    return c;
  }, [queries]);

  if (!isOpen) return null;

  return (
    <div
      className={`dbms-chatbox-window ${dockMode} dbms-query-inspector-container`}
      role="dialog"
      aria-label="DBMS Query Inspector"
    >
      {/* 1. Primary Header */}
      <div className="dbms-chatbox-header">
        <div className="dbms-header-title-wrap">
          <div className="dbms-header-icon-box">
            <Database size={20} />
          </div>
          <div>
            <h3 className="dbms-header-title">
              DBMS Query Inspector
              <span className="dbms-status-dot" title="Database Connected" />
            </h3>
            <p className="dbms-header-subtitle">
              PostgreSQL 16 • 3NF Schema • Live Button Tracker
            </p>
          </div>
        </div>

        <div className="dbms-header-actions">
          {/* Toggle Dock / Float */}
          <button
            className="dbms-icon-btn"
            onClick={toggleDockMode}
            title={dockMode === 'floating' ? 'Dock to right panel' : 'Float as hovering chatbox'}
            aria-label="Toggle layout mode"
          >
            {dockMode === 'floating' ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>

          {/* Export SQL Log */}
          <button
            className="dbms-icon-btn"
            onClick={exportSqlScript}
            title="Download SQL script of all button queries"
            aria-label="Download SQL script"
          >
            <Download size={16} />
          </button>

          {/* Clear Logs */}
          <button
            className="dbms-icon-btn"
            onClick={clearQueries}
            title="Clear query logs"
            aria-label="Clear logs"
          >
            <Trash2 size={16} />
          </button>

          {/* Close Window */}
          <button
            className="dbms-icon-btn"
            onClick={() => setIsOpen(false)}
            title="Close Inspector"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. Secondary Tabs */}
      <div className="dbms-chatbox-tabs">
        <button
          className={`dbms-tab-btn ${activeTab === 'stream' ? 'active' : ''}`}
          onClick={() => setActiveTab('stream')}
        >
          <Activity size={14} />
          <span>Live Query Stream ({totalQueriesCount})</span>
        </button>

        <button
          className={`dbms-tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          <Terminal size={14} />
          <span>DBMS Viva Presets ({DBMS_PRESET_QUERIES.length})</span>
        </button>
      </div>

      {activeTab === 'stream' ? (
        <>
          {/* 3. Filter & Search Toolbar */}
          <div className="dbms-filter-bar">
            <div className="dbms-search-input-wrap">
              <Search size={14} className="dbms-search-icon" />
              <input
                type="text"
                className="dbms-search-input"
                placeholder="Search queries, tables, or button names..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="dbms-chips-wrap">
              {(['ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRANSACTION'] as const).map(type => (
                <button
                  key={type}
                  className={`dbms-chip ${activeFilter === type ? 'active' : ''}`}
                  onClick={() => setActiveFilter(type)}
                >
                  {type} ({counts[type] || 0})
                </button>
              ))}
            </div>
          </div>

          {/* 4. Stream of Query Cards */}
          <div className="dbms-query-list">
            {filteredQueries.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1.5rem',
                  color: '#94A3B8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <Database size={36} color="rgba(198, 84, 195, 0.4)" />
                <h4 style={{ color: '#FFFFFF', margin: 0, fontSize: '0.95rem' }}>No Database Queries Found</h4>
                <p style={{ fontSize: '0.8rem', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
                  Click any button anywhere in the application (like Book Slot, Renew Member, Filter, or Add Teacher) to inspect its database execution!
                </p>
              </div>
            ) : (
              filteredQueries.map((q, idx) => (
                <QueryCard
                  key={q.id}
                  query={q}
                  isLatest={idx === 0}
                  isCopied={copiedQueryId === q.id}
                  onCopy={() => handleCopySql(q.id, q.sql)}
                />
              ))
            )}
          </div>
        </>
      ) : (
        /* 5. DBMS Viva Presets Tab */
        <div className="dbms-presets-list">
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: 'rgba(198, 84, 195, 0.1)',
              border: '1px solid rgba(198, 84, 195, 0.25)',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#F6EFF8',
              lineHeight: 1.5
            }}
          >
            <strong>DBMS Evaluator Suite:</strong> Test core database concepts requested in academic viva reviews (Concurrency Locks, 3NF Joins, Window Functions, Calendar Arithmetic). Click <em>Run Query</em> to execute directly into the stream!
          </div>

          {DBMS_PRESET_QUERIES.map(preset => (
            <div key={preset.id} className="dbms-preset-item">
              <div className="dbms-preset-header">
                <div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#C654C3',
                      textTransform: 'uppercase',
                      fontWeight: 800,
                      letterSpacing: '0.04em'
                    }}
                  >
                    {preset.category}
                  </span>
                  <h4 className="dbms-preset-title">{preset.title}</h4>
                </div>
                <button
                  className="dbms-mini-btn"
                  onClick={() => {
                    executePresetQuery(preset.id);
                    setActiveTab('stream');
                  }}
                  style={{
                    backgroundColor: 'rgba(198, 84, 195, 0.2)',
                    borderColor: '#C654C3',
                    color: '#FFFFFF'
                  }}
                >
                  <Play size={12} fill="#FFFFFF" />
                  <span>Run Query</span>
                </button>
              </div>

              <p className="dbms-preset-desc">{preset.description}</p>

              <pre className="dbms-code-block" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                <code>{renderHighlightedSql(preset.sql)}</code>
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* 6. Operational Status Footer */}
      <div className="dbms-chatbox-footer">
        <span className="dbms-engine-pill">
          <ShieldCheck size={13} />
          <span>PostgreSQL 16 (Port 5432)</span>
        </span>
        <span>
          Showing {filteredQueries.length} of {totalQueriesCount} queries
        </span>
      </div>
    </div>
  );
};

// Sub-component: Individual Query Card
interface QueryCardProps {
  query: QueryRecord;
  isLatest: boolean;
  isCopied: boolean;
  onCopy: () => void;
}

const QueryCard: React.FC<QueryCardProps> = ({ query, isLatest, isCopied, onCopy }) => {
  const typeClass = query.type.toLowerCase();

  return (
    <div className={`dbms-query-card ${isLatest ? 'is-latest' : ''}`}>
      {/* Top Meta Bar */}
      <div className="dbms-card-header">
        <div className="dbms-card-source">
          <span className={`dbms-badge-type ${typeClass}`}>{query.type}</span>
          <span title={query.pageContext}>{query.sourceButton}</span>
        </div>

        <div className="dbms-card-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Clock size={11} />
            {query.timestamp}
          </span>
          <span
            style={{
              color: '#34D399',
              fontWeight: 700,
              fontSize: '0.72rem',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              padding: '0.1rem 0.35rem',
              borderRadius: '4px'
            }}
          >
            ⚡ {query.executionTimeMs}ms
          </span>
        </div>
      </div>

      {/* Code Container */}
      <pre className="dbms-code-block">
        <code>{renderHighlightedSql(query.sql)}</code>
      </pre>

      {/* Footer Info & Copy */}
      <div className="dbms-card-footer">
        <div className="dbms-concept-tag" title={query.dbmsConcept || `Table: ${query.primaryTable}`}>
          <Layers size={12} color="#C654C3" />
          <span>
            <strong>{query.primaryTable}</strong>
            {query.dbmsConcept ? ` • ${query.dbmsConcept}` : ''}
          </span>
        </div>

        <div className="dbms-card-actions">
          <button
            className={`dbms-mini-btn ${isCopied ? 'copied' : ''}`}
            onClick={onCopy}
            title="Copy SQL statement"
          >
            {isCopied ? <Check size={12} /> : <Copy size={12} />}
            <span>{isCopied ? 'Copied' : 'Copy SQL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper: Tokenizes and renders syntax-highlighted SQL
function renderHighlightedSql(sql: string) {
  const tokens = tokenizeSql(sql);
  return tokens.map((token, index) => {
    let className = 'dbms-token-whitespace';
    if (token.type === 'keyword') className = 'dbms-token-keyword';
    if (token.type === 'string') className = 'dbms-token-string';
    if (token.type === 'number') className = 'dbms-token-number';
    if (token.type === 'comment') className = 'dbms-token-comment';
    if (token.type === 'operator') className = 'dbms-token-operator';
    if (token.type === 'punctuation') className = 'dbms-token-punctuation';
    if (token.type === 'identifier') className = 'dbms-token-identifier';

    return (
      <span key={index} className={className}>
        {token.text}
      </span>
    );
  });
}

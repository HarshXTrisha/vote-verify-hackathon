import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CandidateCard from './CandidateCard';
import CandidateDetail from './CandidateDetail';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'summary' | 'compare' | null
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [comparisonList, setComparisonList] = useState([]); // up to 2 candidates
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = useRef(null);
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance' | 'assets_desc' | 'assets_asc' | 'name_asc'
  const [partyFilter, setPartyFilter] = useState('all'); // 'all' | 'inc' | 'bjp'

  useEffect(() => {
    setIsLoading(true);
    fetch('/candidates.json')
      .then(response => response.json())
      .then(data => {
        setCandidates(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading candidate data:', error);
        setIsLoading(false);
      });
  }, []);

  const filteredCandidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(c =>
      [c.name, c.party, c.constituency]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }, [candidates, query]);

  const visibleCandidates = useMemo(() => {
    let list = filteredCandidates;
    if (partyFilter !== 'all') {
      list = list.filter(c => {
        const p = (c.party || '').toLowerCase();
        if (partyFilter === 'inc') return p.includes('congress');
        if (partyFilter === 'bjp') return p.includes('bjp');
        return true;
      });
    }
    if (sortBy === 'assets_desc') {
      list = [...list].sort((a, b) => (b.assets_inr || 0) - (a.assets_inr || 0));
    } else if (sortBy === 'assets_asc') {
      list = [...list].sort((a, b) => (a.assets_inr || 0) - (b.assets_inr || 0));
    } else if (sortBy === 'name_asc') {
      list = [...list].sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }
    return list;
  }, [filteredCandidates, partyFilter, sortBy]);

  function openSummary(candidate) {
    setSelectedCandidate(candidate);
    setModalType('summary');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedCandidate(null);
    setModalType(null);
  }

  function toggleCompare(candidate) {
    const isAlreadySelected = comparisonList.some(c => c.id === candidate.id);
    if (isAlreadySelected) {
      setComparisonList(prev => prev.filter(c => c.id !== candidate.id));
      return;
    }
    // Allow up to 5 candidates for comparison
    setComparisonList(prev => (prev.length < 5 ? [...prev, candidate] : prev));
  }

  function openCompare() {
    if (comparisonList.length >= 2) {
      setModalType('compare');
      setIsModalOpen(true);
    }
  }

  function formatCurrencyINR(value) {
    try {
      return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
    } catch (e) {
      return value;
    }
  }

  function getPartyClass(party) {
    const p = (party || '').toLowerCase();
    if (p.includes('congress')) return 'inc';
    if (p.includes('bjp')) return 'bjp';
    return '';
  }

  useEffect(() => {
    const handler = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isTypingInField = activeTag === 'input' || activeTag === 'textarea';
      if (isTypingInField) return;
      if (e.key === '/' || (e.ctrlKey && (e.key === 'k' || e.key === 'K'))) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-inner">
          <div className="brand">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1>VoteVerify</h1>
            </Link>
            <p>Search and compare candidate affidavits</p>
          </div>
          <div className="actions">
            <div className="search-wrapper">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 21l-4.35-4.35" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                <circle cx="11" cy="11" r="7" stroke="#64748b" strokeWidth="2" />
              </svg>
              <input
                className="search-input"
                placeholder="Search by name, party, or constituency"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search candidates"
                ref={searchInputRef}
              />
              {query && (
                <button
                  type="button"
                  className="search-clear"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <>
              <section className="hero">
                <div className="hero-inner">
                  <div className="hero-copy">
                    <h2 className="hero-title">Discover and compare candidates</h2>
                    <p className="hero-sub">Search, filter and inspect affidavits to make informed choices.</p>
                  </div>
                  <div className="hero-stats">
                    <div className="hero-stat">
                      <div className="hero-stat-value">{candidates.length}</div>
                      <div className="hero-stat-label">Total candidates</div>
                    </div>
                    <div className="hero-stat">
                      <div className="hero-stat-value">{visibleCandidates.length}</div>
                      <div className="hero-stat-label">Visible</div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="filter-bar">
                <div className="filters-left">
                  <button
                    className={`chip-filter ${partyFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setPartyFilter('all')}
                  >All</button>
                  <button
                    className={`chip-filter ${partyFilter === 'inc' ? 'active' : ''}`}
                    onClick={() => setPartyFilter('inc')}
                  >INC</button>
                  <button
                    className={`chip-filter ${partyFilter === 'bjp' ? 'active' : ''}`}
                    onClick={() => setPartyFilter('bjp')}
                  >BJP</button>
                </div>
                <div className="filters-right">
                  <label className="select-label" htmlFor="sortBy">Sort</label>
                  <select
                    id="sortBy"
                    className="select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="assets_desc">Assets: High to Low</option>
                    <option value="assets_asc">Assets: Low to High</option>
                    <option value="name_asc">Name: A to Z</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="skeleton-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-card" />
                  ))}
                </div>
              ) : visibleCandidates.length === 0 ? (
                <div className="empty">
                  <div className="empty-title">No candidates found</div>
                  <div className="empty-sub">Try adjusting your search or filters.</div>
                  <div className="empty-actions">
                    <button className="btn" onClick={() => { setQuery(''); setPartyFilter('all'); setSortBy('relevance'); }}>Clear search & filters</button>
                  </div>
                </div>
              ) : (
                <div className="candidate-list">
                  {visibleCandidates.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onQuickSummary={openSummary}
                      onToggleCompare={toggleCompare}
                      isCompared={comparisonList.some(c => c.id === candidate.id)}
                    />
                  ))}
                </div>
              )}
            </>
          }
        />
        <Route path="/candidate/:id" element={<CandidateDetail candidates={candidates} />} />
      </Routes>

      {isModalOpen && modalType === 'summary' && selectedCandidate && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="summary-title"
          onClick={closeModal}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="summary-title" className="modal-title">{selectedCandidate.name}</h3>
            </div>
            <div className="modal-body">
              <p>{selectedCandidate.plainLanguageSummary || 'No summary available.'}</p>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && modalType === 'compare' && comparisonList.length >= 2 && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="compare-title"
          onClick={closeModal}
        >
          <div className="modal wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="compare-title" className="modal-title">Compare Candidates</h3>
            </div>
            <div className="modal-body">
              {/* Mobile stacked cards */}
              <div className="compare-mobile">
                {comparisonList.map((cand) => (
                  <div key={cand.id} className="compare-card">
                    <h4>{cand.name}</h4>
                    <div className="compare-row"><div>Party</div><div>{cand.party}</div></div>
                    <div className="compare-row"><div>Constituency</div><div>{cand.constituency || '—'}</div></div>
                    <div className="compare-row"><div>Profession</div><div>{cand.profession || '—'}</div></div>
                    <div className="compare-row"><div>Assets</div><div>₹{formatCurrencyINR(cand.assets_inr)}</div></div>
                    <div className="compare-row"><div>Liabilities</div><div>₹{formatCurrencyINR(cand.liabilities_inr)}</div></div>
                    <div className="compare-row"><div>Criminal cases</div><div>{cand.criminal_cases}</div></div>
                    <div className="compare-row"><div>Education</div><div>{cand.education || '—'}</div></div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="compare-desktop compare-table-wrapper">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th></th>
                      {comparisonList.map((cand) => (
                        <th key={cand.id}>
                          <div className="th-meta">
                            <img className="th-photo" src={cand.photo_url} alt={cand.name} />
                            <div>
                              <div className="th-name">{cand.name}</div>
                              <span className={`party-badge ${getPartyClass(cand.party)}`}>{cand.party}</span>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Constituency</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>{cand.constituency || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Profession</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>{cand.profession || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Assets</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>₹{formatCurrencyINR(cand.assets_inr)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Liabilities</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>₹{formatCurrencyINR(cand.liabilities_inr)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Criminal cases</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>{cand.criminal_cases}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Education</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>{cand.education || '—'}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>Affidavit</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>
                          {cand.myneta_url ? (
                            <a href={cand.myneta_url} target="_blank" rel="noreferrer">Open</a>
                          ) : '—'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {comparisonList.length > 0 && (
        <div className="compare-bar">
          <div className="compare-chips">
            {comparisonList.map((c) => (
              <div key={c.id} className="chip">
                <img className="chip-photo" src={c.photo_url} alt={c.name} />
                <span className="chip-name">{c.name}</span>
                <button className="chip-remove" aria-label={`Remove ${c.name}`} onClick={() => toggleCompare(c)}>×</button>
              </div>
            ))}
          </div>
          <button
            className="btn primary compare-action"
            onClick={openCompare}
            disabled={comparisonList.length < 2}
          >
            {comparisonList.length < 2 ? 'Select at least 2 to compare' : `Compare (${comparisonList.length})`}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
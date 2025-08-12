import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CandidateCard from './CandidateCard';
import CandidateDetail from './CandidateDetail';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { getTranslation } from './translations';
import { useTranslation } from 'react-i18next';
import { nameMapHiById } from './nameMapHi';

function AppContent() {
  const { language } = useLanguage();
  const { i18n } = useTranslation();
  const [langPulse, setLangPulse] = useState(false);
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
  // Removed custom cursor
  const headerRef = useRef(null);
  const todayString = useMemo(() => {
    try {
      return new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }, []);

  const handleLangChange = (lng) => {
    if (i18n.language === lng) return;
    setLangPulse(true);
    i18n.changeLanguage(lng);
    window.setTimeout(() => setLangPulse(false), 220);
  };

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

  // Global statistics across all candidates
  const stats = useMemo(() => {
    const count = candidates.length;
    const sumAssets = candidates.reduce((sum, c) => sum + (Number(c.assets_inr) || 0), 0);
    const averageAssets = count > 0 ? sumAssets / count : 0;
    return { count, averageAssets };
  }, [candidates]);

  function openSummary(candidate) {
    setSelectedCandidate(candidate);
    setModalType('summary');
    setIsModalOpen(true);
    document.body.classList.add('no-scroll');
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedCandidate(null);
    setModalType(null);
    document.body.classList.remove('no-scroll');
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
      document.body.classList.add('no-scroll');
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

  // Removed custom cursor effects

  // Elevate header on scroll for better visual depth
  useEffect(() => {
    const onScroll = () => {
      const el = headerRef.current;
      if (!el) return;
      if (window.scrollY > 8) el.classList.add('elevated');
      else el.classList.remove('elevated');
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="App">
      {/* default cursor restored */}
      <header ref={headerRef} className="App-header">
        <div className="header-inner">
          <div className="brand">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div className="brand-row">
                <span className="logo-mark" aria-hidden="true">
                  <img 
                    src="/Gemini_Generated_Image_ngtua4ngtua4ngtu.png" 
                    alt="Jan Saarthi Logo" 
                    width="1024" 
                    height="1024"
                    style={{ objectFit: 'contain' }}
                  />
                </span>
                <h1>{getTranslation(language, 'appTitle')}</h1>
              </div>
            </Link>
            <p>{getTranslation(language, 'appSubtitle')}</p>
          </div>
          <div className="actions">
            {/* i18next language buttons with animation */}
            <div className={`lang-buttons ${i18n.language === 'hi' ? 'hi' : ''} ${langPulse ? 'pulse' : ''}`}>
              <button
                className={`btn ${i18n.language === 'en' ? 'primary' : ''}`}
                onClick={() => handleLangChange('en')}
              >
                English
              </button>
              <button
                className={`btn ${i18n.language === 'hi' ? 'primary' : ''}`}
                onClick={() => handleLangChange('hi')}
              >
                हिंदी
              </button>
            </div>
            <div className="search-wrapper">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 21l-4.35-4.35" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                <circle cx="11" cy="11" r="7" stroke="#64748b" strokeWidth="2" />
              </svg>
              <input
                className="search-input"
                placeholder={getTranslation(language, 'searchPlaceholder')}
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
            {comparisonList.length >= 2 && (
              <button className="btn primary header-compare" onClick={openCompare}>
                {getTranslation(language, 'compareButton')} ({comparisonList.length})
              </button>
            )}
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
                    <h2 className="hero-title">{getTranslation(language, 'heroTitle')}</h2>
                    <p className="hero-sub">{getTranslation(language, 'heroSubtitle')}</p>
                  </div>
                  <div className="hero-stats">
                    <div className="hero-stat">
                      <div className="hero-stat-value">{candidates.length}</div>
                      <div className="hero-stat-label">{getTranslation(language, 'totalCandidates')}</div>
                    </div>
                    <div className="hero-stat">
                      <div className="hero-stat-value">{visibleCandidates.length}</div>
                      <div className="hero-stat-label">{getTranslation(language, 'visible')}</div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="filter-bar">
                <div className="filters-left">
                  <button
                    className={`chip-filter ${partyFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setPartyFilter('all')}
                  >{getTranslation(language, 'all')}</button>
                  <button
                    className={`chip-filter ${partyFilter === 'inc' ? 'active' : ''}`}
                    onClick={() => setPartyFilter('inc')}
                  >{getTranslation(language, 'inc')}</button>
                  <button
                    className={`chip-filter ${partyFilter === 'bjp' ? 'active' : ''}`}
                    onClick={() => setPartyFilter('bjp')}
                  >{getTranslation(language, 'bjp')}</button>
                </div>
                <div className="filters-right">
                  <label className="select-label" htmlFor="sortBy">{getTranslation(language, 'sort')}</label>
                  <select
                    id="sortBy"
                    className="select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">{getTranslation(language, 'relevance')}</option>
                    <option value="assets_desc">{getTranslation(language, 'assetsHighToLow')}</option>
                    <option value="assets_asc">{getTranslation(language, 'assetsLowToHigh')}</option>
                    <option value="name_asc">{getTranslation(language, 'nameAZ')}</option>
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
                  <div className="empty-title">{getTranslation(language, 'noCandidatesFound')}</div>
                  <div className="empty-sub">{getTranslation(language, 'tryAdjustingFilters')}</div>
                  <div className="empty-actions">
                    <button className="btn" onClick={() => { setQuery(''); setPartyFilter('all'); setSortBy('relevance'); }}>{getTranslation(language, 'clearSearchFilters')}</button>
                  </div>
                </div>
              ) : (
                <div className="candidate-list">
                  {visibleCandidates.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={{
                        ...candidate,
                        name: i18n.language === 'hi' ? (nameMapHiById[candidate.id] || candidate.name) : candidate.name
                      }}
                      onQuickSummary={openSummary}
                      onToggleCompare={toggleCompare}
                      isCompared={comparisonList.some(c => c.id === candidate.id)}
                      stats={stats}
                    />
                  ))}
                </div>
              )}
            </>
          }
        />
        <Route path="/candidate/:id" element={<CandidateDetail candidates={candidates} stats={stats} />} />
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
              <p>{selectedCandidate.plainLanguageSummary || getTranslation(language, 'noSummaryAvailable')}</p>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={closeModal}>{getTranslation(language, 'close')}</button>
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
              <h3 id="compare-title" className="modal-title">{getTranslation(language, 'compareCandidates')}</h3>
            </div>
            <div className="modal-body">
              {/* Mobile stacked cards */}
              <div className="compare-mobile">
                {comparisonList.map((cand) => (
                  <div key={cand.id} className="compare-card">
                    <h4>{cand.name}</h4>
                    <div className="compare-row"><div>{getTranslation(language, 'party')}</div><div>{cand.party}</div></div>
                    <div className="compare-row"><div>{getTranslation(language, 'constituency')}</div><div>{cand.constituency || getTranslation(language, 'dash')}</div></div>
                    <div className="compare-row"><div>{getTranslation(language, 'profession')}</div><div>{cand.profession || getTranslation(language, 'dash')}</div></div>
                    <div className="compare-row"><div>{getTranslation(language, 'assets')}</div><div>₹{formatCurrencyINR(cand.assets_inr)}</div></div>
                    <div className="compare-row"><div>{getTranslation(language, 'liabilities')}</div><div>₹{formatCurrencyINR(cand.liabilities_inr)}</div></div>
                    <div className="compare-row"><div>{getTranslation(language, 'criminalCases')}</div><div>{cand.criminal_cases}</div></div>
                    <div className="compare-row"><div>{getTranslation(language, 'education')}</div><div>{cand.education || getTranslation(language, 'dash')}</div></div>
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
                      <td>{getTranslation(language, 'constituency')}</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>{cand.constituency || getTranslation(language, 'dash')}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>{getTranslation(language, 'profession')}</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>{cand.profession || getTranslation(language, 'dash')}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>{getTranslation(language, 'assets')}</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>₹{formatCurrencyINR(cand.assets_inr)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>{getTranslation(language, 'liabilities')}</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>₹{formatCurrencyINR(cand.liabilities_inr)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>{getTranslation(language, 'criminalCases')}</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>{cand.criminal_cases}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>{getTranslation(language, 'education')}</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>{cand.education || getTranslation(language, 'dash')}</td>
                      ))}
                    </tr>
                    <tr>
                      <td>{getTranslation(language, 'affidavit')}</td>
                      {comparisonList.map((cand) => (
                        <td key={cand.id}>
                          {cand.myneta_url ? (
                            <a href={cand.myneta_url} target="_blank" rel="noreferrer">{getTranslation(language, 'open')}</a>
                          ) : getTranslation(language, 'dash')}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn" onClick={closeModal}>{getTranslation(language, 'close')}</button>
                <button
                  type="button"
                  className="btn whatsapp"
                  onClick={() => {
                    if (!comparisonList || comparisonList.length < 2) return;
                    const [a, b] = comparisonList;
                    const text = `Check out this direct comparison between ${a.name} and ${b.name} on Jan Saarthi! See the details here: https://vote-verify-hackathon.vercel.app/ - Shared by harshvardhan singh`;
                    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <span className="wa-icon" aria-hidden="true">
                    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                      <path d="M19.11 17.27c-.28-.14-1.64-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.28-.73.9-.9 1.08-.17.19-.35.21-.64.07-.28-.14-1.19-.44-2.26-1.4-.84-.75-1.4-1.68-1.57-1.96-.16-.28-.02-.43.12-.57.12-.12.28-.3.42-.45.14-.16.19-.26.28-.43.09-.17.05-.32-.02-.45-.07-.14-.64-1.54-.88-2.11-.23-.55-.46-.48-.64-.49-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.77.35-.26.28-1 1-1 2.43 0 1.43 1.03 2.82 1.17 3 .14.19 2.03 3.1 4.92 4.28.69.3 1.24.48 1.67.61.7.22 1.34.19 1.85.11.56-.08 1.64-.67 1.87-1.32.23-.65.23-1.21.16-1.32-.07-.11-.26-.18-.54-.32zM26.76 5.24C23.82 2.31 20.03.75 16 .75 7.32.75.25 7.83.25 16.5c0 2.84.74 5.61 2.14 8.06L.76 31.25l6.89-1.58c2.39 1.31 5.1 2 7.85 2h.01c8.67 0 15.75-7.08 15.75-15.75 0-3.98-1.55-7.73-4.5-10.68zM16.5 29.18h-.01c-2.45 0-4.85-.66-6.94-1.92l-.5-.3-4.09.94.87-3.98-.33-.51c-1.33-2.13-2.03-4.6-2.03-7.07 0-7.42 6.04-13.46 13.46-13.46 3.59 0 6.97 1.4 9.51 3.95 2.54 2.54 3.95 5.92 3.95 9.51 0 7.42-6.04 13.46-13.46 13.46z" />
                    </svg>
                  </span>
                  Share on WhatsApp
                </button>
              </div>
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
            {comparisonList.length < 2 ? getTranslation(language, 'selectAtLeast2') : `${getTranslation(language, 'compareButton')} (${comparisonList.length})`}
          </button>
        </div>
      )}

      <footer className="site-footer">
        <div className="footer-inner">
          <span>{getTranslation(language, 'dataLastUpdated')} {todayString}</span>
          <a
            href={
              `mailto:report@janssaarthi.app?subject=${encodeURIComponent('Issue Report: Jan Saarthi')}&body=${encodeURIComponent('Describe the issue you found:\n\nPage/URL: \nSteps to reproduce: \nExpected result: \nActual result: \nScreenshots (if any): ')}`
            }
          >
            {getTranslation(language, 'reportIssue')}
          </a>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
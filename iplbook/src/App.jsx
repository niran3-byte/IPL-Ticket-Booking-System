import { useEffect, useMemo, useState } from 'react';

const matches = [
  {
    id: 'mi-rr',
    short: 'MI vs RR',
    home: 'Mumbai Indians',
    away: 'Rajasthan Royals',
    homeCode: 'MI',
    awayCode: 'RR',
    homeColor: '#39b7ff',
    awayColor: '#f3bb39',
    date: 'FRI, 18 APR',
    time: '7:30 PM',
    stadium: 'Wankhede Stadium',
    city: 'Mumbai',
    from: 1800,
    status: 'LIVE',
    demand: 'Fast moving',
    gate: 'Gate 4 open',
    note: 'Under the lights',
    available: 312,
  },
  {
    id: 'rcb-csk',
    short: 'RCB vs CSK',
    home: 'Royal Challengers Bengaluru',
    away: 'Chennai Super Kings',
    homeCode: 'RCB',
    awayCode: 'CSK',
    homeColor: '#e74646',
    awayColor: '#f0c83c',
    date: 'SAT, 19 APR',
    time: '7:30 PM',
    stadium: 'M. Chinnaswamy Stadium',
    city: 'Bengaluru',
    from: 2200,
    status: 'QUEUE',
    demand: 'High demand',
    gate: 'Queue active',
    note: 'Queue protected',
    available: 96,
  },
  {
    id: 'gt-srh',
    short: 'GT vs SRH',
    home: 'Gujarat Titans',
    away: 'Sunrisers Hyderabad',
    homeCode: 'GT',
    awayCode: 'SRH',
    homeColor: '#83a8cf',
    awayColor: '#ef7627',
    date: 'SUN, 20 APR',
    time: '3:30 PM',
    stadium: 'Narendra Modi Stadium',
    city: 'Ahmedabad',
    from: 1400,
    status: 'OPEN',
    demand: 'Good availability',
    gate: 'Gates from 1 PM',
    note: 'Sunday afternoon',
    available: 824,
  },
  {
    id: 'dc-kkr',
    short: 'DC vs KKR',
    home: 'Delhi Capitals',
    away: 'Kolkata Knight Riders',
    homeCode: 'DC',
    awayCode: 'KKR',
    homeColor: '#4c8ce6',
    awayColor: '#a36ee8',
    date: 'TUE, 22 APR',
    time: '7:30 PM',
    stadium: 'Arun Jaitley Stadium',
    city: 'New Delhi',
    from: 1200,
    status: 'OPEN',
    demand: 'Good availability',
    gate: 'Gates from 5 PM',
    note: 'Midweek cricket',
    available: 634,
  },
];

const navItems = [
  { id: 'home', label: 'Overview', icon: '⌂' },
  { id: 'matches', label: 'Find a match', icon: '◈' },
  { id: 'queue', label: 'Live queue', icon: '↗', badge: '2.4k' },
  { id: 'tickets', label: 'My tickets', icon: '▣', badge: '2' },
  { id: 'resale', label: 'Verified resale', icon: '♢' },
];

const seats = Array.from({ length: 36 }, (_, index) => {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const status = index === 3 || index === 26 ? 'locked' : index === 6 || index === 29 ? 'booked' : index === 14 || index === 15 ? 'resale' : 'available';
  return {
    id: `W-${String.fromCharCode(65 + row)}-${String(col + 1).padStart(2, '0')}`,
    x: 90 + col * 39,
    y: 94 + row * 36,
    row: String.fromCharCode(65 + row),
    number: col + 1,
    status,
    price: row < 2 ? 2200 : 1800,
  };
});

const stadiumSections = [
  { id: 'a-stand', label: 'A Stand', price: 3585, color: '#b8df8b', seats: 24, note: 'Best price' },
  { id: 'b-stand', label: 'B Stand', price: 3660, color: '#a9d97c', seats: 18, note: 'Fan favourite' },
  { id: 'c-stand', label: 'C Stand', price: 13126, color: '#c4e59b', seats: 4, note: 'Premium view' },
  { id: 'd-corporate', label: 'D Corporate', price: 4930, color: '#acd982', seats: 12, note: 'Corporate' },
  { id: 'e-stand', label: 'E Stand', price: 14864, color: '#b9df8e', seats: 4, note: 'Almost sold out' },
  { id: 'h-upper', label: 'H Upper', price: 3660, color: '#a8d67a', seats: 20, note: 'Clear view' },
  { id: 'p-corporate', label: 'P Corporate', price: 27263, color: '#9fd170', seats: 8, note: 'Premium' },
  { id: 'p-terrace', label: 'P Terrace', price: 13444, color: '#b6de89', seats: 16, note: 'Best view' },
];

const stadiumShapes = [
  { id: 'a-stand', d: 'M76 130 L108 58 Q138 28 180 21 L195 74 Q158 83 133 111 Z', labelX: 112, labelY: 92 },
  { id: 'b-stand', d: 'M108 58 Q143 20 194 19 L224 19 L224 76 Q192 75 163 87 Z', labelX: 165, labelY: 55 },
  { id: 'c-stand', d: 'M232 18 Q278 18 313 36 L286 84 Q260 74 232 75 Z', labelX: 270, labelY: 48 },
  { id: 'e-stand', d: 'M316 38 Q361 62 388 104 L334 127 Q320 100 286 84 Z', labelX: 350, labelY: 91 },
  { id: 'h-upper', d: 'M394 112 Q413 153 401 197 L344 177 Q350 151 335 127 Z', labelX: 372, labelY: 153 },
  { id: 'p-corporate', d: 'M315 264 Q272 286 226 283 L226 226 Q260 228 289 211 Z', labelX: 270, labelY: 259 },
  { id: 'p-terrace', d: 'M222 283 Q174 281 132 258 L163 207 Q191 225 225 226 Z', labelX: 175, labelY: 258 },
  { id: 'd-corporate', d: 'M79 196 Q66 155 78 125 L133 144 Q126 171 139 195 Z', labelX: 104, labelY: 161 },
];

const formatINR = (amount) => `₹${amount.toLocaleString('en-IN')}`;
const apiFetch = async (path, options = {}) => {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request failed');
  return payload;
};
const normalizeMatch = (match) => ({ ...match, home: match.home || match.homeTeam, away: match.away || match.awayTeam, homeCode: match.homeCode || String(match.homeTeam || '').slice(0, 3).toUpperCase(), awayCode: match.awayCode || String(match.awayTeam || '').slice(0, 3).toUpperCase(), homeColor: match.homeColor || '#39b7ff', awayColor: match.awayColor || '#f3bb39', date: match.date || new Date(match.startsAt).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase(), time: match.time || new Date(match.startsAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }), from: match.from || 1200, demand: match.demand || (match.status === 'queue' ? 'High demand' : 'Good availability'), gate: match.gate || 'Gates from 5 PM', note: match.note || 'Live fixture', available: match.available ?? 0, status: String(match.status || 'open').toUpperCase() });

function App() {
  const [activeView, setActiveView] = useState(() => {
    const path = window.location.pathname.replace('/', '');
    return ['matches', 'queue', 'tickets', 'resale', 'admin'].includes(path) ? path : 'home';
  });
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [queueJoined, setQueueJoined] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All matches');
  const [toast, setToast] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [liveMatches, setLiveMatches] = useState(matches);

  useEffect(() => {
    apiFetch('/api/matches').then(({ matches: remoteMatches }) => {
      if (Array.isArray(remoteMatches) && remoteMatches.length) setLiveMatches(remoteMatches.map(normalizeMatch));
    }).catch(() => setToast({ type: 'warning', title: 'Demo data active', body: 'The match list is using the safe local fallback until the API is configured.' }));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const interval = setInterval(() => {
      if (Date.now() >= lockedUntil) {
        setLockedUntil(null);
        setSelectedSeats([]);
        setToast({ type: 'warning', title: 'Seat hold expired', body: 'Your seats were released safely. No payment was taken.' });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const filteredMatches = useMemo(() => liveMatches.filter((match) => {
    const matchesQuery = `${match.home || match.homeTeam} ${match.away || match.awayTeam} ${match.stadium} ${match.city}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'All matches' || (filter === 'Queue protected' ? match.status === 'QUEUE' : match.status === 'OPEN');
    return matchesQuery && matchesFilter;
  }), [filter, liveMatches, query]);

  const navigate = (view) => {
    setActiveView(view);
    window.history.replaceState({}, '', view === 'home' ? '/' : `/${view}`);
  };

  const handleBook = (match) => {
    if (match.status === 'QUEUE') {
    apiFetch('/api/queue/join', { method: 'POST', body: JSON.stringify({ matchId: match.id }) }).then(() => {
      setQueueJoined(true);
      navigate('queue');
      setToast({ type: 'success', title: 'You’re in the fair queue', body: 'No refresh needed — we’ll move you when it’s your turn.' });
    }).catch((error) => setToast({ type: 'warning', title: 'Queue unavailable', body: error.message }));
      return;
    }
    setSelectedMatch(match);
    setSelectedSeats([]);
    setLockedUntil(null);
  };

  const toggleSeat = (seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') {
      setToast({ type: 'warning', title: 'That seat just moved', body: 'Choose another green seat to keep your group together.' });
      return;
    }
    setSelectedSeats((current) => current.some((item) => item.id === seat.id) ? current.filter((item) => item.id !== seat.id) : [...current, seat]);
  };

  const startSeatHold = () => {
    if (!selectedSeats.length) {
      setToast({ type: 'warning', title: 'Pick a seat first', body: 'Select one or more green seats on the stadium map.' });
      return;
    }
    apiFetch('/api/seats/lock', { method: 'POST', body: JSON.stringify({ matchId: selectedMatch.id, seatIds: selectedSeats.map((seat) => seat.id) }) }).then(({ expiresAt }) => {
      setLockedUntil(new Date(expiresAt).getTime());
      setToast({ type: 'success', title: 'Seats held for 5:00', body: 'Your lock is server-validated before checkout.' });
    }).catch((error) => setToast({ type: 'warning', title: 'Seat hold failed', body: error.message }));
  };

  const selectCompartment = (section, requestedCount = selectedSeats.length || 1) => {
    const sectionIndex = stadiumSections.findIndex((item) => item.id === section.id);
    const candidates = seats.filter((seat, index) => seat.status === 'available' && index % stadiumSections.length === sectionIndex);
    const fallback = seats.filter((seat) => seat.status === 'available');
    const pool = candidates.length ? candidates : fallback;
    if (!pool.length) {
      setToast({ type: 'warning', title: 'Compartment sold out', body: 'That compartment has no available seats right now.' });
      return;
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const assignedSeats = shuffled.slice(0, Math.min(requestedCount, pool.length));
    setSelectedSeats(assignedSeats);
    setLockedUntil(null);
    setToast({ type: 'success', title: `${section.label} selected`, body: `${assignedSeats.length} random seat${assignedSeats.length === 1 ? '' : 's'} assigned. Hold them for five minutes to continue.` });
  };

  const closeBooking = () => {
    setSelectedMatch(null);
    setSelectedSeats([]);
    setLockedUntil(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark" onClick={() => navigate('home')} role="button" tabIndex="0">
          <div className="brand-symbol"><span>I</span><span>P</span></div>
          <div><strong>IPL</strong><small>BOOKINGS</small></div>
        </div>
        <div className="sidebar-label">Your matchday</div>
        <nav className="main-nav">
          {navItems.map((item) => (
            <button key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <button className={`nav-item admin-link ${activeView === 'admin' ? 'active' : ''}`} onClick={() => navigate('admin')}><span className="nav-icon">◌</span><span>Operations</span></button>
        <div className="trust-card">
          <span className="live-dot" />
          <div><strong>Live protection</strong><p>Redis queue + seat locks active</p></div>
        </div>
        <button className="profile-mini" onClick={() => setShowProfile(!showProfile)}><span className="avatar">AS</span><span><strong>Arjun Sharma</strong><small>Fan account</small></span><span className="chevron">⌄</span></button>
      </aside>

      <main className="main-stage">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-symbol"><span>I</span><span>P</span></div><strong>IPL BOOKINGS</strong></div>
          <div className="breadcrumbs"><span>Season 2025</span><span>/</span><strong>{activeView === 'home' ? 'Overview' : navItems.find((item) => item.id === activeView)?.label || 'Operations'}</strong></div>
          <div className="topbar-actions"><button className="icon-button" aria-label="Search" onClick={() => navigate('matches')}>⌕</button><button className="icon-button notification" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => setShowNotifications(!showNotifications)}>♧<i /></button><button className="top-avatar" onClick={() => setShowProfile(!showProfile)}>AS</button></div>
        </header>

        {activeView === 'home' && <HomeView matches={liveMatches} onBook={handleBook} onNavigate={navigate} />}
        {activeView === 'matches' && <MatchesView query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} matches={filteredMatches} onBook={handleBook} />}
        {activeView === 'queue' && <QueueView joined={queueJoined} onJoin={() => { setQueueJoined(true); setToast({ type: 'success', title: 'Queue ticket issued', body: 'Your position is protected server-side.' }); }} />}
        {activeView === 'tickets' && <TicketsView onToast={setToast} />}
        {activeView === 'resale' && <ResaleView onToast={setToast} />}
        {activeView === 'admin' && <AdminView />}
      </main>

      {selectedMatch && <BookingDrawer match={selectedMatch} seats={seats} selectedSeats={selectedSeats} lockedUntil={lockedUntil} onToggleSeat={toggleSeat} onSelectCompartment={selectCompartment} onHold={startSeatHold} onClose={closeBooking} onToast={setToast} />}
      {showNotifications && <NotificationPopover onClose={() => setShowNotifications(false)} />}
      {showProfile && <ProfilePopover onClose={() => setShowProfile(false)} />}
      {toast && <div className={`toast toast-${toast.type}`}><span className="toast-icon">{toast.type === 'success' ? '✓' : '!'}</span><div><strong>{toast.title}</strong><p>{toast.body}</p></div><button onClick={() => setToast(null)}>×</button></div>}
    </div>
  );
}

function HomeView({ matches: liveMatches, onBook, onNavigate }) {
  return <div className="content-wrap">
    <section className="hero-panel">
      <div className="hero-copy"><span className="eyebrow"><span className="live-dot" /> IPL 2025 • OPEN NOW</span><h1>Big nights.<br /><em>Fair access.</em></h1><p>Find your place in the noise. Secure tickets with transparent pricing, live seat locks, and a queue that plays fair.</p><div className="hero-actions"><button className="primary-button" onClick={() => onNavigate('matches')}>Explore matches <span>↗</span></button><button className="text-button" onClick={() => onNavigate('queue')}>How the queue works <span>→</span></button></div></div>
      <div className="hero-visual"><div className="floodlight one" /><div className="floodlight two" /><div className="hero-score"><span>UP NEXT</span><strong>MI <b>vs</b> RR</strong><small>18 APR • 7:30 PM</small></div><div className="hero-stadium"><div className="stadium-ring ring-outer" /><div className="stadium-ring ring-middle" /><div className="stadium-pitch"><span>WANKHEDE</span></div><div className="stand-label north">NORTH STAND</div><div className="stand-label south">SOUTH STAND</div></div><div className="hero-note"><span>✦</span><div><strong>12,842 fans</strong><small>already found their seats</small></div></div></div>
      <div className="hero-grid-lines" />
    </section>

    <section className="section-block upcoming-section"><div className="section-heading"><div><span className="section-kicker">THE FIXTURE LIST</span><h2>Pick your next <em>matchday</em></h2></div><button className="arrow-link" onClick={() => onNavigate('matches')}>View all matches <span>↗</span></button></div><div className="match-rail">{liveMatches.slice(0, 3).map((match) => <MatchCard key={match.id} match={match} onBook={onBook} />)}</div></section>

    <section className="feature-strip"><div className="feature-item"><span className="feature-icon mint">↗</span><div><strong>Fair queues, always</strong><p>Randomised entry for high-demand games. No bots, no shortcuts.</p></div></div><div className="feature-item"><span className="feature-icon yellow">◷</span><div><strong>5-minute seat hold</strong><p>Your chosen seats stay yours while you check out.</p></div></div><div className="feature-item"><span className="feature-icon blue">♢</span><div><strong>Verified resale</strong><p>Face-value tickets with fresh QR credentials every time.</p></div></div></section>
  </div>;
}

function MatchesView({ query, setQuery, filter, setFilter, matches: filtered, onBook }) {
  return <div className="content-wrap"><div className="page-intro"><div><span className="section-kicker">FIXTURES / 01</span><h1>Find your <em>match</em></h1><p>Every seat, every price, in one clear view.</p></div><div className="live-pulse"><span className="live-dot" /> Live inventory syncing</div></div><div className="filter-bar"><div className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search team, stadium or city" /></div><div className="filter-pills">{['All matches', 'Open seats', 'Queue protected'].map((item) => <button className={filter === item ? 'selected' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="match-list">{filtered.length ? filtered.map((match) => <MatchCard key={match.id} match={match} onBook={onBook} expanded />) : <div className="empty-state"><span>⌕</span><h3>No match found</h3><p>Try another team, city, or stadium.</p></div>}</div></div>;
}

function MatchCard({ match, onBook, expanded = false }) {
  return <article className={`match-card ${expanded ? 'expanded' : ''}`}><div className="match-date"><span>{match.date.split(',')[0]}</span><strong>{match.date.split(',')[1]}</strong><small>{match.time}</small></div><div className="teams"><TeamBadge code={match.homeCode} color={match.homeColor} /><div className="team-names"><strong>{match.home}</strong><span>vs</span><strong>{match.away}</strong></div><TeamBadge code={match.awayCode} color={match.awayColor} /></div><div className="match-meta"><span>⌖ {match.stadium}</span><span>₹ from {match.from.toLocaleString('en-IN')}</span></div><div className="match-status"><span className={`status-pill ${match.status.toLowerCase()}`}><i />{match.status === 'QUEUE' ? 'Queue protected' : match.status === 'LIVE' ? 'On sale now' : 'Seats available'}</span><small>{match.available} seats left</small></div><button className={`card-action ${match.status === 'QUEUE' ? 'queue-action' : ''}`} onClick={() => onBook(match)}>{match.status === 'QUEUE' ? 'Join queue' : 'Book tickets'} <span>↗</span></button></article>;
}

function TeamBadge({ code, color }) { return <div className="team-badge" style={{ '--team-color': color }}><span>{code}</span><i /></div>; }

function QueueView({ joined, onJoin }) {
  return <div className="content-wrap"><div className="page-intro"><div><span className="section-kicker">HIGH-DEMAND ACCESS / 02</span><h1>The fair <em>queue</em></h1><p>Stay here. We’ll bring the booking window to you.</p></div><div className="live-pulse"><span className="live-dot" /> Updates every 8 sec</div></div><section className="queue-layout"><div className="queue-main"><div className="queue-card"><div className="queue-card-top"><span className="eyebrow"><span className="live-dot" /> QUEUE ACTIVE</span><span className="queue-refresh">Last checked just now ⟳</span></div><div className="queue-match"><TeamBadge code="RCB" color="#e74646" /><div><strong>Royal Challengers Bengaluru <span>vs</span> Chennai Super Kings</strong><small>Sat, 19 Apr • M. Chinnaswamy Stadium</small></div><TeamBadge code="CSK" color="#f0c83c" /></div>{joined ? <><div className="position-block"><span>Your position</span><strong>#1,284</strong><small>of 8,642 fans in line</small></div><div className="progress-track"><span style={{ width: '68%' }} /></div><div className="queue-stats"><div><span>Estimated wait</span><strong>18 min</strong></div><div><span>Booking window</span><strong>7:30 — 8:00 PM</strong></div><div><span>Access</span><strong className="mint-text">Protected</strong></div></div><div className="queue-message"><span>✦</span><p><strong>Keep this tab open.</strong> Your place is saved server-side. We’ll issue a short-lived booking pass when you’re admitted.</p></div></> : <div className="queue-empty"><span className="queue-number">01</span><h3>Queue access is ready</h3><p>Join once. Keep your place. No refreshing, no racing.</p><button className="primary-button" onClick={onJoin}>Join the fair queue <span>↗</span></button></div>}</div></div><aside className="queue-side"><div className="side-card"><span className="section-kicker">HOW IT WORKS</span><ol><li><i>1</i><div><strong>Join once</strong><p>We securely save your place.</p></div></li><li><i>2</i><div><strong>Wait fairly</strong><p>Randomised entry keeps it balanced.</p></div></li><li><i>3</i><div><strong>Book calmly</strong><p>You get a short-lived access pass.</p></div></li></ol></div><div className="side-card accent-card"><span className="feature-icon yellow">◷</span><strong>No refresh needed</strong><p>Our live queue status keeps moving in the background, so your place stays protected.</p></div></aside></section></div>;
}

function TicketsView({ onToast }) {
  return <div className="content-wrap"><div className="page-intro"><div><span className="section-kicker">YOUR MATCHDAYS / 03</span><h1>My <em>tickets</em></h1><p>Fresh QR credentials, tied to your account.</p></div><button className="outline-button" onClick={() => onToast({ type: 'success', title: 'Wallet link ready', body: 'Your tickets can be added to a mobile wallet after payment clears.' })}>+ Add to wallet</button></div><div className="ticket-grid"><TicketCard upcoming onToast={onToast} /><TicketCard onToast={onToast} /></div><div className="security-note"><span>✓</span><p><strong>Ticket security is active.</strong> QR codes rotate and are invalidated automatically if a ticket is transferred or scanned.</p></div></div>;
}

function TicketCard({ upcoming, onToast }) {
  return <article className={`ticket-card ${upcoming ? 'upcoming-ticket' : ''}`}><div className="ticket-main"><div className="ticket-label"><span>{upcoming ? 'NEXT MATCH' : 'USED TICKET'}</span><small>{upcoming ? 'SAT, 19 APR • 7:30 PM' : 'SUN, 06 APR • 3:30 PM'}</small></div><div className="ticket-teams"><strong>{upcoming ? 'RCB' : 'MI'}</strong><span>vs</span><strong>{upcoming ? 'CSK' : 'DC'}</strong></div><p>{upcoming ? 'M. Chinnaswamy Stadium, Bengaluru' : 'Wankhede Stadium, Mumbai'}</p><div className="ticket-details"><span>STAND <strong>{upcoming ? 'WEST A' : 'NORTH B'}</strong></span><span>ROW <strong>{upcoming ? 'G' : 'D'}</strong></span><span>SEAT <strong>{upcoming ? '12' : '08'}</strong></span></div></div><div className="ticket-stub"><div className="qr-pattern">{Array.from({ length: 25 }, (_, index) => <i key={index} className={index % 3 === 0 || index % 7 === 0 ? 'dark' : ''} />)}</div><small>{upcoming ? 'QR READY' : 'SCANNED'}</small><button onClick={() => onToast({ type: upcoming ? 'success' : 'warning', title: upcoming ? 'Ticket credentials valid' : 'Ticket already used', body: upcoming ? 'Server-side validation passed. Show this QR at Gate 4.' : 'Entry was recorded on 06 Apr.' })}>View ticket ↗</button></div></article>;
}

function ResaleView({ onToast }) {
  return <div className="content-wrap"><div className="page-intro"><div><span className="section-kicker">FAN-TO-FAN / 04</span><h1>Verified <em>resale</em></h1><p>Real tickets. Face value only. Fresh credentials on transfer.</p></div><button className="outline-button" onClick={() => onToast({ type: 'success', title: 'Seller checks passed', body: 'Your eligible tickets will appear here when listed.' })}>List a ticket</button></div><div className="resale-toolbar"><div className="filter-pills"><button className="selected">All matches</button><button>Under ₹2,000</button><button>West stand</button></div><span><span className="live-dot" /> 48 verified listings</span></div><div className="resale-grid">{[
    { match: 'MI vs RR', place: 'Wankhede Stadium', date: '18 APR', stand: 'North Stand', row: 'F', price: 1800, code: 'MI', color: '#39b7ff' },
    { match: 'RCB vs CSK', place: 'M. Chinnaswamy', date: '19 APR', stand: 'East Pavilion', row: 'J', price: 2200, code: 'RCB', color: '#e74646' },
    { match: 'GT vs SRH', place: 'Narendra Modi', date: '20 APR', stand: 'West A', row: 'C', price: 1400, code: 'GT', color: '#83a8cf' },
  ].map((listing) => <article className="resale-card" key={listing.match}><div className="resale-card-top"><TeamBadge code={listing.code} color={listing.color} /><span className="verified-badge">✓ VERIFIED</span></div><span className="section-kicker">{listing.date}</span><h3>{listing.match}</h3><p>{listing.place}</p><div className="resale-seat"><span>{listing.stand} • Row {listing.row}</span><strong>{formatINR(listing.price)}</strong></div><button className="card-action" onClick={() => onToast({ type: 'success', title: 'Listing reserved', body: 'Complete checkout to transfer this ticket to your account.' })}>View ticket <span>↗</span></button></article>)}</div></div>;
}

function AdminView() {
  return <div className="content-wrap"><div className="page-intro"><div><span className="section-kicker">OPERATIONS / INTERNAL</span><h1>Control <em>room</em></h1><p>A clear view of what is moving right now.</p></div><span className="live-pulse"><span className="live-dot" /> All systems healthy</span></div><div className="metric-grid"><Metric label="Gross sales" value="₹48.6L" delta="+18.4%" tone="mint" /><Metric label="Active queue" value="2,418" delta="RCB vs CSK" tone="yellow" /><Metric label="Seats locked" value="386" delta="5 min TTL" tone="blue" /><Metric label="Scan rate" value="96.8%" delta="1,204 entries" tone="coral" /></div><section className="ops-panel"><div className="ops-heading"><div><span className="section-kicker">LIVE MONITOR</span><h2>Match operations</h2></div><button className="outline-button">Export report ↓</button></div><div className="ops-table"><div className="ops-row ops-head"><span>Match</span><span>Queue</span><span>Seat locks</span><span>Resale</span><span>Status</span></div>{matches.map((match) => <div className="ops-row" key={match.id}><span className="ops-match"><TeamBadge code={match.homeCode} color={match.homeColor} /><strong>{match.short}</strong></span><span>{match.status === 'QUEUE' ? '2,418 waiting' : '—'}</span><span>{match.status === 'QUEUE' ? '386 active' : `${Math.round(match.available * .2)} active`}</span><span>{match.status === 'QUEUE' ? '48 listings' : '12 listings'}</span><span className={`status-pill ${match.status.toLowerCase()}`}><i />{match.status === 'QUEUE' ? 'Protected' : 'On sale'}</span></div>)}</div></section></div>;
}

function Metric({ label, value, delta, tone }) { return <div className="metric-card"><span className={`metric-spark ${tone}`} /> <span className="metric-label">{label}</span><strong>{value}</strong><small className={tone === 'coral' ? 'coral-text' : 'mint-text'}>{delta}</small></div>; }

function BookingDrawer({ match, seats: seatData, selectedSeats: chosen, lockedUntil, onToggleSeat, onSelectCompartment, onHold, onClose, onToast }) {
  const [, setClock] = useState(Date.now());
  useEffect(() => {
    if (!lockedUntil) return undefined;
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [lockedUntil]);
  const secondsLeft = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000)) : 0;
  const total = chosen.reduce((sum, seat) => sum + seat.price, 0);
  const [activeSection, setActiveSection] = useState(stadiumSections[0].id);
  const ticketCount = Math.max(1, chosen.length || 1);
  const selectedSection = stadiumSections.find((section) => section.id === activeSection) || stadiumSections[0];
  const selectSection = (section) => {
    setActiveSection(section.id);
    onToast({ type: 'success', title: `${section.label} selected`, body: `${section.seats} tickets available from ${formatINR(section.price)} each. Choose ticket quantity to assign random seats.` });
  };
  const changeTicketCount = (nextCount) => onSelectCompartment(selectedSection, Math.max(1, Math.min(6, nextCount)));
  return <div className="drawer-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="booking-drawer stadium-drawer">
    <div className="drawer-header"><div><span className="section-kicker">SELECT YOUR SEATS / LIVE MAP</span><h2>{match.short}</h2><p>{match.stadium} • {match.date} • {match.time}</p></div><button className="close-button" onClick={onClose}>×</button></div>
    <div className="stadium-booking-layout">
      <div className="seat-area ring-map-area">
        <div className="map-toolbar"><span><i className="legend-dot available" /> Available</span><span><i className="legend-dot locked" /> Held</span><span><i className="legend-dot booked" /> Sold</span><span><i className="legend-dot resale" /> Resale</span><div className="zoom-controls"><button>−</button><span>100%</span><button>+</button></div></div>
        <div className="ring-stadium-map"><div className="map-label top-map-label">NORTH STAND</div><svg viewBox="0 0 470 300" role="img" aria-label="Clickable ring stadium section map" className="ring-svg"><circle cx="235" cy="150" r="137" fill="#f3f6ef" stroke="#d7ded2" strokeWidth="5" /><circle cx="235" cy="150" r="93" fill="#8fc447" stroke="#fff" strokeWidth="13" /><rect x="226" y="132" width="18" height="38" rx="2" fill="#f3bc37" stroke="#fff" strokeWidth="2" transform="rotate(-14 235 151)" /><text x="235" y="156" fill="#eff8df" fontSize="8" textAnchor="middle" letterSpacing="2">PITCH</text>{stadiumShapes.map((shape) => { const section = stadiumSections.find((item) => item.id === shape.id); return <g key={shape.id} className={`ring-section ${activeSection === shape.id ? 'active' : ''}`} onClick={() => { selectSection(section); onSelectCompartment(section); }}><path d={shape.d} fill={section.color} stroke="#fff" strokeWidth="2" /><text x={shape.labelX} y={shape.labelY} textAnchor="middle" fill="#426136" fontSize="8" fontWeight="700">{section.label.replace(' Stand', '').replace(' Corporate', '')}</text></g>; })}</svg>{selectedSection && <div className="map-price-tag"><strong>{formatINR(selectedSection.price)}</strong><span>{selectedSection.label}</span><small>{selectedSection.seats} tickets left</small></div>}<div className="ring-map-footer"><span>Click a section to explore</span><span>Clear view ◉</span></div></div>
        <div className="seat-helper"><span>i</span><p>Choose a compartment to receive one random available seat. Individual seat picking is disabled so every booking stays inside the selected compartment.</p></div>
      </div>
      <aside className="stand-inventory"><div className="inventory-heading"><div><span className="section-kicker">STANDS & BLOCKS</span><h3>Find your view</h3></div><span className="inventory-count">48 listings</span></div><div className="stand-list">{stadiumSections.map((section) => <button key={section.id} className={`stand-row ${activeSection === section.id ? 'active' : ''}`} onClick={() => { selectSection(section); onSelectCompartment(section, ticketCount); }}><span className="stand-swatch" style={{ background: section.color }} /><span className="stand-copy"><strong>{section.label}</strong><small>◉ {section.seats} tickets available</small><em>{section.note}</em></span><span className="stand-price">{formatINR(section.price)}<small>per ticket</small></span></button>)}</div><div className="summary-panel"><span className="section-kicker">YOUR SELECTION</span><div className="ticket-quantity"><div><strong>Tickets</strong><small>Random seats in {selectedSection.label}</small></div><div className="quantity-stepper"><button aria-label="Decrease ticket count" onClick={() => changeTicketCount(ticketCount - 1)} disabled={ticketCount <= 1}>−</button><strong>{ticketCount}</strong><button aria-label="Increase ticket count" onClick={() => changeTicketCount(ticketCount + 1)} disabled={ticketCount >= 6}>+</button></div></div>{chosen.length ? <div className="selected-seat-list">{chosen.map((seat) => <div className="selected-seat" key={seat.id}><span>{seat.id}</span><strong>{formatINR(seat.price)}</strong><button onClick={() => onToggleSeat(seat)}>×</button></div>)}</div> : <div className="summary-empty"><span>＋</span><p>Choose a compartment to assign random seats.</p></div>}<div className="summary-line"><span>{chosen.length} {chosen.length === 1 ? 'ticket' : 'tickets'}</span><strong>{formatINR(total)}</strong></div><div className="summary-line fee"><span>Platform protection</span><strong>{chosen.length ? formatINR(Math.round(total * .04)) : '—'}</strong></div><div className="summary-total"><span>Total</span><strong>{formatINR(total + Math.round(total * .04))}</strong></div>{lockedUntil ? <div className="lock-countdown"><span>HELD FOR YOU</span><strong className="live-countdown">{String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</strong><small>Server lock active</small></div> : <button className="primary-button full-width" onClick={onHold}>Hold seats for 5 minutes <span>↗</span></button>}<button className="secure-copy" onClick={() => onToast({ type: 'success', title: 'Secure checkout', body: 'Payment is processed only after the server revalidates your seat lock.' })}>▣ Secure sandbox checkout <span>ⓘ</span></button></div></aside>
    </div>
  </section></div>;
}

function ProfilePopover({ onClose }) { return <div className="profile-popover"><div className="popover-top"><span className="avatar large">AS</span><div><strong>Arjun Sharma</strong><small>Member since 2024</small></div><button onClick={onClose}>×</button></div><div className="profile-stat"><span>Matchdays attended</span><strong>06</strong></div><div className="profile-stat"><span>Queue fairness score</span><strong className="mint-text">100%</strong></div><button className="outline-button full-width" onClick={onClose}>Account settings</button></div>; }

function NotificationPopover({ onClose }) { return <div className="notification-popover"><div className="popover-top"><div><span className="section-kicker">MATCHDAY UPDATES</span><strong>Notifications</strong></div><button onClick={onClose} aria-label="Close notifications">×</button></div><div className="notification-item"><span className="notification-dot mint" /><div><strong>Your queue is protected</strong><p>RCB vs CSK updates will appear here.</p><small>Just now</small></div></div><div className="notification-item"><span className="notification-dot yellow" /><div><strong>Seat locks are active</strong><p>Held seats expire after five minutes.</p><small>2 min ago</small></div></div><button className="outline-button full-width" onClick={onClose}>Mark all as read</button></div>; }

export default App;

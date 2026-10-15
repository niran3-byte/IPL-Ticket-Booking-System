const base = process.env.API_BASE_URL || 'http://127.0.0.1:3000';
const request = async (path, options) => { const response = await fetch(`${base}${path}`, { headers: { 'content-type': 'application/json' }, ...options }); const body = await response.json(); if (!response.ok) throw new Error(`${path} ${response.status}: ${JSON.stringify(body)}`); return body; };
const health = await request('/api/health');
const matches = await request('/api/matches');
const queue = await request('/api/queue/join', { method: 'POST', body: JSON.stringify({ matchId: 'rcb-csk' }) });
const lock = await request('/api/seats/lock', { method: 'POST', body: JSON.stringify({ matchId: 'mi-rr', seatIds: ['W-A-01'] }) });
const invalidLogin = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'nobody@example.com', password: 'incorrect' }) });
if (invalidLogin.status !== 401) throw new Error(`Expected invalid login to return 401, got ${invalidLogin.status}`);
console.log(JSON.stringify({ health: health.mode, matchCount: matches.matches.length, queue: queue.status, lock: lock.mode, invalidLogin: invalidLogin.status }, null, 2));

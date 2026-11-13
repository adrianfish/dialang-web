import http from 'k6/http';
import { check } from 'k6';

// Converted from bin/dialang.jmx (JMeter 5.6.3).
// Two deliberate deviations from the .jmx, both of which made the original 500:
//   tl 'spa_es' -> 'es-ES'      (KV is keyed by BCP-47 tag; no data:vspt-words:spa_es exists)
//   SA payload 32 ids -> 18     (only these are present in data:sa-weights:reading)
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8787';

const ADMIN_LANGUAGE = 'en-GB';
const TEST_LANGUAGE = 'es-ES';
const SKILL = 'reading';

const VSPT_WORDS = [
  '000905', '000906', '000908', '000909', '000911', '000912', '000917', '000919', '000923', '000925',
  '000928', '000929', '000930', '000931', '000933', '000935', '000939', '000940', '000943', '000945',
  '000947', '000948', '000951', '000952', '000954', '000956', '000957', '000959', '000960', '000961',
  '000963', '000964', '000966', '000968', '000975', '000976', '000982', '000983', '000984', '000986',
  '000987', '000990', '000992', '000993', '000994', '000995', '001000', '001001', '001002', '001003',
  '001006', '001007', '001009', '001011', '001012', '001013', '001015', '001018', '001020', '001021',
  '001022', '001023', '001024', '001025', '001032', '001033', '001034', '001036', '001037', '001039',
  '001040', '001042', '001043', '001048', '001050',
];

// Must stay a subset of data:sa-weights:<skill> in KV: getSaRawScore sums
// wordMap[id] and an unknown id yields undefined, making the raw score NaN.
const SA_STATEMENTS = [
  '01', '03', '05', '07', '11', '17', '21', '22', '23', '27', '28', '30', '31', '32', '33', '34',
  '35', '36',
];

const VSPT_BODY = JSON.stringify(
  Object.fromEntries(VSPT_WORDS.map((id) => [`word:${id}`, 'valid'])),
);

const SA_BODY = JSON.stringify(
  Object.fromEntries(SA_STATEMENTS.map((id) => [`statement:${id}`, 'yes'])),
);

export const options = {
  scenarios: {
    // JMeter: 40 threads x 200 loops, ramp 1s (no k6 equivalent, effectively instantaneous).
    dialang: {
      executor: 'per-vu-iterations',
      vus: 20,
      iterations: 4,
      maxDuration: '30m',
    },
  },
  // p(95) limits measured on local wrangler dev at 40 VUs (2026-11-12) plus ~70%
  // headroom. Retune before pointing this at a deployed Worker.
  thresholds: {
    'checks': ['rate>0.99'],
    'http_req_failed': ['rate<0.01'],
    'http_req_duration': ['p(95)<1000'],
    'http_req_duration{name:SetAL}': ['p(95)<800'],
    'http_req_duration{name:SetTL}': ['p(95)<700'],
    'http_req_duration{name:ScoreVSPT}': ['p(95)<1000'],
    'http_req_duration{name:ScoreSA}': ['p(95)<1000'],
  },
};

// k6 v2 has no FormData module, so JMeter's DO_MULTIPART_POST body is assembled by hand.
const BOUNDARY = '----dialangK6Boundary';
const MULTIPART_HEADERS = { 'Content-Type': `multipart/form-data; boundary=${BOUNDARY}` };

function multipart(fields) {
  const parts = Object.entries(fields)
    .map(([name, value]) => `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`)
    .join('');
  return `${parts}--${BOUNDARY}--\r\n`;
}

export default function dialangFlow() {
  // SetAL issues the session cookie that SetTL, ScoreVSPT and ScoreSA all require.
  const setAl = http.post(
    `${BASE_URL}/api/setal`,
    multipart({ al: ADMIN_LANGUAGE }),
    { headers: MULTIPART_HEADERS, tags: { name: 'SetAL' } },
  );
  check(setAl, { 'SetAL status is 200': (r) => r.status === 200 });

  const setTl = http.post(
    `${BASE_URL}/api/settl`,
    multipart({ tl: TEST_LANGUAGE, skill: SKILL }),
    { headers: MULTIPART_HEADERS, tags: { name: 'SetTL' } },
  );
  check(setTl, { 'SetTL status is 200': (r) => r.status === 200 });

  const scoreVspt = http.post(
    `${BASE_URL}/api/scorevspt`,
    VSPT_BODY,
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'ScoreVSPT' } },
  );
  check(scoreVspt, { 'ScoreVSPT status is 200': (r) => r.status === 200 });

  const scoreSa = http.post(
    `${BASE_URL}/api/scoresa`,
    SA_BODY,
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'ScoreSA' } },
  );
  check(scoreSa, { 'ScoreSA status is 200': (r) => r.status === 200 });
}

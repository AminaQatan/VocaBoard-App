/* ---------- Illustrated backgrounds (original drawings, 1600x900 scenes and repeating tiles) ---------- */
const INK = '#3b2f4a';
function rnd(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647, (s - 1) / 2147483646); }
const lg = (id, stops, vert = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vert ? 0 : 1}" y2="${vert ? 1 : 0}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
const cloud = (x, y, s, op = .92) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity="${op}"><ellipse cx="0" cy="0" rx="70" ry="24"/><circle cx="-30" cy="-10" r="26"/><circle cx="8" cy="-24" r="34"/><circle cx="42" cy="-6" r="22"/></g>`;
const pine = (x, y, h, col) => `<path d="M${x} ${y - h}L${x + h * .26} ${y - h * .55}H${x + h * .14}L${x + h * .36} ${y - h * .18}H${x + h * .2}L${x + h * .4} ${y}H${x - h * .4}L${x - h * .2} ${y - h * .18}H${x - h * .36}L${x - h * .14} ${y - h * .55}H${x - h * .26}Z" fill="${col}"/>`;
const flower = (x, y, r, col) => { let p = ''; for (let i = 0; i < 5; i++) { const a = i * 1.2566; p += `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${r * .75}" fill="${col}"/>`; } return p + `<circle cx="${x}" cy="${y}" r="${r * .6}" fill="#ffb21e"/>`; };
const eye = (x, y, r = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + r * .35}" cy="${y - r * .4}" r="${r * .36}" fill="#fff"/>`;
const blush = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="4" fill="#ff8fb0" opacity=".65"/>`;
const wrap = (body, w = 1600, h = 900) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax slice" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

function meadowBase(seed, flowers = 50) {
  const r = rnd(seed); let f = '';
  for (let i = 0; i < flowers; i++) f += flower(Math.round(r() * 1600), Math.round(790 + r() * 100), 4 + r() * 4, ['#ff8fb1', '#ffffff', '#ffd84d', '#c6a8ff'][i % 4]);
  return `<defs>${lg('sk', [[0, '#9fdcfa'], [1, '#eaf8ff']])}</defs><rect width="1600" height="900" fill="url(#sk)"/>
  <g stroke="#ffe27a" stroke-width="8">${[...Array(10)].map((_, i) => { const a = i * .628; return `<path d="M${180 + Math.cos(a) * 92} ${150 + Math.sin(a) * 92}L${180 + Math.cos(a) * 122} ${150 + Math.sin(a) * 122}"/>`; }).join('')}</g><circle cx="180" cy="150" r="70" fill="#ffe27a"/>
  ${cloud(560, 160, 1.2)}${cloud(1050, 110, .9)}${cloud(1420, 220, 1.1)}
  <path d="M0 560C300 480 600 520 900 560C1150 592 1400 500 1600 530V900H0Z" fill="#c4e6a0"/>
  <path d="M0 660C250 600 520 640 760 670C1000 700 1300 612 1600 650V900H0Z" fill="#9bd476"/>
  <path d="M0 770C300 728 600 790 900 768C1200 746 1400 796 1600 774V900H0Z" fill="#78c25e"/>${f}`;
}
function sceneMountains() {
  const r = rnd(7); let trees = '';
  for (let x = 20; x < 1600; x += 34 + r() * 40) trees += pine(Math.round(x), 748, 70 + r() * 70, r() > .5 ? '#2f7a52' : '#3d8c5f');
  return wrap(`<defs>${lg('sk', [[0, '#8ccbf0'], [.8, '#fde3cc']])}${lg('lk', [[0, '#82c7e6'], [1, '#3f9fc8']])}</defs>
  <rect width="1600" height="900" fill="url(#sk)"/><circle cx="1180" cy="360" r="150" fill="#fff4cf" opacity=".35"/><circle cx="1180" cy="360" r="95" fill="#fff4cf"/>
  ${cloud(300, 170, 1.3)}${cloud(820, 120, 1)}${cloud(1420, 210, 1.1)}
  <path d="M0 640L180 430L330 560L520 360L700 560L860 420L1040 600L1250 380L1430 560L1600 450V720H0Z" fill="#bcc3e8"/>
  <path d="M-20 700L260 400L430 560L640 300L900 640L1080 470L1260 610L1420 420L1620 640V740H-20Z" fill="#8b9bd3"/>
  <g fill="#fff"><path d="M640 300L713 395L690 385L670 400L650 383L625 398L605 380L581 373Z"/><path d="M260 400L302 440L285 436L270 450L252 438L232 452L190 475Z"/><path d="M1420 420L1470 475L1452 470L1436 482L1420 470L1400 480L1380 467Z"/><path d="M1080 470L1125 512L1108 508L1092 518L1078 506L1060 514L1035 503Z"/></g>
  <path d="M0 720C200 660 380 690 560 700C760 712 900 650 1100 680C1300 710 1450 670 1600 690V760H0Z" fill="#5aa874"/>${trees}
  <rect y="742" width="1600" height="158" fill="url(#lk)"/><ellipse cx="1180" cy="790" rx="90" ry="9" fill="#fff4cf" opacity=".7"/><ellipse cx="1180" cy="815" rx="55" ry="6" fill="#fff4cf" opacity=".5"/>
  <g stroke="#fff" stroke-width="4" opacity=".55"><path d="M180 790h120M420 830h80M760 800h140M980 850h90M1350 830h120M560 870h110"/></g>`);
}
function sceneMeadow() {
  return wrap(meadowBase(11, 60) + `<rect x="1238" y="540" width="22" height="100" rx="8" fill="#8a5a3b"/><circle cx="1220" cy="520" r="52" fill="#5fae4f"/><circle cx="1280" cy="510" r="56" fill="#6dbb57"/><circle cx="1250" cy="470" r="50" fill="#79c463"/>
  <g transform="translate(700 470)"><ellipse cx="-12" cy="0" rx="14" ry="10" fill="#ffb3d0"/><ellipse cx="12" cy="0" rx="14" ry="10" fill="#ffb3d0"/><path d="M0 -8v16" stroke="${INK}" stroke-width="3"/></g>
  <g transform="translate(980 420)"><ellipse cx="-11" cy="0" rx="12" ry="9" fill="#c6a8ff"/><ellipse cx="11" cy="0" rx="12" ry="9" fill="#c6a8ff"/><path d="M0 -7v14" stroke="${INK}" stroke-width="3"/></g>`);
}
function camel(x, y, s) { return `<g transform="translate(${x} ${y}) scale(${s})" fill="#7a3f55"><ellipse cx="0" cy="0" rx="28" ry="13"/><ellipse cx="-2" cy="-12" rx="14" ry="12"/><path d="M22 -6C32 -12 34 -26 38 -34H48L50 -28L44 -27C42 -17 38 -2 28 6Z"/><rect x="-22" y="6" width="5" height="28" rx="2"/><rect x="-13" y="6" width="5" height="28" rx="2"/><rect x="12" y="6" width="5" height="28" rx="2"/><rect x="20" y="6" width="5" height="28" rx="2"/></g>`; }
function palm(x, y, s, col) { return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${col}" stroke-linecap="round"><path d="M0 0C6 -60 -4 -120 10 -170" stroke-width="14"/><g stroke-width="9"><path d="M10 -170C-20 -190 -60 -185 -80 -160"/><path d="M10 -170C40 -195 80 -190 100 -165"/><path d="M10 -170C-10 -210 -45 -220 -65 -205"/><path d="M10 -170C30 -215 65 -222 82 -205"/><path d="M10 -170C0 -200 5 -225 14 -235"/></g></g>`; }
function sceneDesert() {
  return wrap(`<defs>${lg('sk', [[0, '#5a4b9a'], [.45, '#c56b8f'], [.75, '#f6a27a'], [1, '#ffd79a']])}</defs><rect width="1600" height="900" fill="url(#sk)"/>
  <circle cx="1050" cy="560" r="170" fill="#ffe9a8" opacity=".3"/><circle cx="1050" cy="560" r="110" fill="#ffe9a8"/>
  <g fill="none" stroke="#5a3a5a" stroke-width="4"><path d="M380 220q12 -12 24 0q12 -12 24 0"/><path d="M460 260q9 -9 18 0q9 -9 18 0"/><path d="M1260 180q12 -12 24 0q12 -12 24 0"/></g>
  <path d="M0 600C200 560 420 590 620 610C820 630 1000 560 1240 580C1400 594 1500 570 1600 580V900H0Z" fill="#f0a26c"/>
  ${camel(760, 585, .9)}${camel(840, 590, .8)}${camel(905, 594, .7)}
  <path d="M0 690C240 620 480 640 700 700C900 752 1100 650 1350 660C1480 665 1550 690 1600 700V900H0Z" fill="#e48d54"/>
  <path d="M700 700C900 752 1100 650 1350 660C1200 690 1050 760 980 800C900 760 800 720 700 700Z" fill="#d07a44" opacity=".55"/>
  ${palm(150, 720, 1, '#6b3550')}${palm(250, 735, .75, '#6b3550')}${palm(1470, 700, .9, '#6b3550')}
  <path d="M0 790C260 742 520 760 760 800C980 838 1250 760 1600 780V900H0Z" fill="#cf7a3f"/>
  <path d="M760 800C980 838 1250 760 1600 780V820C1300 800 1050 860 900 900H700C780 870 800 830 760 800Z" fill="#b9682f" opacity=".5"/>`);
}
function sceneBeach() {
  const r = rnd(5); let shells = '';
  for (let i = 0; i < 10; i++) shells += `<ellipse cx="${Math.round(80 + r() * 1440)}" cy="${Math.round(830 + r() * 55)}" rx="7" ry="5" fill="${['#ffd2c2', '#fff1d6', '#ffc6d9'][i % 3]}"/>`;
  const star = (x, y, s) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 9 : 22; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr * s).toFixed(1) + ' ' + (y + Math.sin(a) * rr * s).toFixed(1); } return `<path d="${d}Z" fill="#ff9a76" stroke="#e8735a" stroke-width="3"/>`; };
  return wrap(`<defs>${lg('sk', [[0, '#7fd3fb'], [1, '#e3f7ff']])}${lg('se', [[0, '#1fa8cf'], [1, '#6fd6e6']])}</defs><rect width="1600" height="900" fill="url(#sk)"/>
  <circle cx="1300" cy="170" r="110" fill="#fff1a8" opacity=".35"/><circle cx="1300" cy="170" r="70" fill="#fff1a8"/>${cloud(320, 150, 1.2)}${cloud(780, 230, .8)}
  <g fill="none" stroke="#4a5d78" stroke-width="4"><path d="M560 300q12 -12 24 0q12 -12 24 0"/><path d="M630 340q9 -9 18 0q9 -9 18 0"/></g>
  <rect y="540" width="1600" height="240" fill="url(#se)"/>
  <g transform="translate(430 560)"><path d="M-60 0H60L42 26H-42Z" fill="#ff7b72" stroke="${INK}" stroke-width="4"/><path d="M0 -4V-110L64 -10Z" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="M-6 -10V-90L-50 -10Z" fill="#ffe07f" stroke="${INK}" stroke-width="4"/></g>
  <g fill="none" stroke="#fff" stroke-width="5" opacity=".6"><path d="M80 620q40 -18 80 0t80 0"/><path d="M700 650q40 -18 80 0t80 0"/><path d="M1150 610q40 -18 80 0t80 0"/><path d="M300 700q40 -18 80 0t80 0"/><path d="M980 715q40 -18 80 0t80 0"/></g>
  <path d="M0 760C300 722 700 742 1000 736C1300 730 1450 702 1600 712V900H0Z" fill="#f8dfa5"/>
  <path d="M0 760C300 722 700 742 1000 736C1300 730 1450 702 1600 712" fill="none" stroke="#fff" stroke-width="10" opacity=".8"/>
  <g transform="translate(250 820)"><path d="M0 0V-150" stroke="#8a5a3b" stroke-width="7"/><path d="M-110 -140A110 70 0 0 1 110 -140Z" fill="#ff8fb1" stroke="${INK}" stroke-width="4"/><path d="M-36 -140Q0 -215 0 -210Q0 -215 36 -140Z" fill="#fff"/><path d="M-110 -140A110 70 0 0 1 110 -140Z" fill="none" stroke="${INK}" stroke-width="4"/></g>
  ${star(720, 840, 1)}${star(1010, 860, .7)}${shells}
  <g transform="translate(1390 820)"><path d="M0 0C-20 -110 -60 -230 -40 -360" fill="none" stroke="#b07a45" stroke-width="28"/><g stroke="#8e5f32" stroke-width="5"><path d="M-14 -60h28M-24 -130h28M-34 -200h28M-40 -270h28"/></g>
   <g fill="#3fae5a" stroke="#2e8a46" stroke-width="3"><path d="M-40 -360C-120 -400 -200 -380 -250 -320C-180 -350 -110 -350 -40 -350Z"/><path d="M-40 -360C40 -410 140 -400 190 -330C120 -360 40 -360 -40 -350Z"/><path d="M-40 -360C-90 -440 -170 -460 -220 -430C-150 -430 -90 -400 -40 -355Z"/><path d="M-40 -360C0 -450 80 -470 130 -445C60 -440 10 -410 -40 -355Z"/><path d="M-40 -360C-60 -300 -110 -250 -160 -230C-110 -290 -80 -330 -45 -360Z"/></g>
   <circle cx="-48" cy="-345" r="13" fill="#7a4a2a"/><circle cx="-28" cy="-340" r="13" fill="#7a4a2a"/></g>`);
}
function sceneForest() {
  const r = rnd(23); let far = '', mid = '', near = '';
  for (let x = -20; x < 1640; x += 50 + r() * 40) far += pine(Math.round(x), 640, 180 + r() * 90, '#a8d5b2');
  for (let x = -40; x < 1640; x += 70 + r() * 60) mid += pine(Math.round(x), 760, 220 + r() * 110, '#6fae80');
  for (const x of [40, 170, 290, 1330, 1450, 1570]) near += pine(x, 900, 330 + r() * 120, '#2f6b4a');
  const mush = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-9" y="-24" width="18" height="26" rx="7" fill="#fff6e6" stroke="${INK}" stroke-width="3"/><path d="M-32 -22C-32 -52 32 -52 32 -22Z" fill="#e8545a" stroke="${INK}" stroke-width="3"/><circle cx="-14" cy="-34" r="5" fill="#fff"/><circle cx="8" cy="-40" r="4" fill="#fff"/><circle cx="18" cy="-28" r="4" fill="#fff"/></g>`;
  return wrap(`<defs>${lg('sk', [[0, '#cdeedb'], [1, '#fbfff0']])}</defs><rect width="1600" height="900" fill="url(#sk)"/>
  <g fill="#fff" opacity=".28"><path d="M1500 0L1580 0L900 900L700 900Z"/><path d="M1320 0L1380 0L560 900L420 900Z"/></g>${far}${mid}
  <path d="M0 780C400 758 1200 800 1600 770V900H0Z" fill="#5e9e5d"/><path d="M700 900C740 860 780 820 820 790C850 800 880 830 900 900Z" fill="#c9b07a" opacity=".7"/>${near}
  ${mush(560, 830, 1)}${mush(605, 842, .7)}${mush(1080, 820, .85)}`);
}
function sceneNight() {
  const r = rnd(41); let stars = '';
  for (let i = 0; i < 150; i++) stars += `<circle cx="${Math.round(r() * 1600)}" cy="${Math.round(r() * 620)}" r="${(.8 + r() * 1.6).toFixed(1)}" fill="#fff" opacity="${(.4 + r() * .6).toFixed(2)}"/>`;
  const sp = (x, y, s) => `<path d="M${x} ${y - 14 * s}Q${x} ${y} ${x + 14 * s} ${y}Q${x} ${y} ${x} ${y + 14 * s}Q${x} ${y} ${x - 14 * s} ${y}Q${x} ${y} ${x} ${y - 14 * s}Z" fill="#fff6c8"/>`;
  let trees = ''; for (const [x, hh] of [[90, 200], [150, 150], [1460, 210], [1530, 160], [1380, 130]]) trees += pine(x, 790, hh, '#11173a');
  return wrap(`<defs>${lg('sk', [[0, '#0e1440'], [.6, '#26306b'], [1, '#5b4e93']])}<mask id="mo"><rect width="1600" height="900" fill="#fff"/><circle cx="1290" cy="178" r="74" fill="#000"/></mask><linearGradient id="ss" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#sk)"/>${stars}${sp(300, 160, 1.2)}${sp(620, 90, .8)}${sp(980, 260, 1)}${sp(1480, 380, .9)}${sp(180, 430, .7)}${sp(760, 400, .6)}
  <circle cx="1250" cy="200" r="130" fill="#fff3c4" opacity=".12"/><circle cx="1250" cy="200" r="82" fill="#fff3c4" mask="url(#mo)"/>
  <path d="M420 120L560 200" stroke="url(#ss)" stroke-width="4"/>
  <path d="M0 700C300 640 600 700 900 680C1200 660 1400 620 1600 650V900H0Z" fill="#232b5e"/>
  <g transform="translate(400 700)"><path d="M-60 0V-60L0 -110L60 -60V0Z" fill="#1a2149"/><rect x="-18" y="-58" width="36" height="30" rx="4" fill="#ffd97a"/><path d="M0 -58v30M-18 -43h36" stroke="#1a2149" stroke-width="4"/><rect x="28" y="-120" width="16" height="36" fill="#1a2149"/></g>
  ${trees}<path d="M0 800C400 760 900 820 1600 780V900H0Z" fill="#161c42"/>`);
}

/* cute animals */
function catFace(x, y, col, st) {
  return `<g transform="translate(${x} ${y})" stroke="${INK}" stroke-width="4"><path d="M-38 -16L-34 -58L-6 -34Z" fill="${col}"/><path d="M38 -16L34 -58L6 -34Z" fill="${col}"/><path d="M-30 -26L-30 -47L-16 -35Z" fill="#ffb3c7" stroke="none"/><path d="M30 -26L30 -47L16 -35Z" fill="#ffb3c7" stroke="none"/>
  <ellipse rx="45" ry="36" fill="${col}"/><path d="M-9 -34v9M0 -36v11M9 -34v9" stroke="${st}" stroke-width="5"/>${eye(-16, -4)}${eye(16, -4)}<path d="M-5 6h10l-5 6z" fill="#ff8fab" stroke="none"/><path d="M0 12q-5 7 -11 2M0 12q5 7 11 2" fill="none" stroke-width="3"/>${blush(-28, 10)}${blush(28, 10)}<path d="M-32 4h-18M-32 11l-17 5M32 4h18M32 11l17 5" stroke-width="2.5"/></g>`;
}
const paw = (x, y, c) => `<g fill="${c}" transform="translate(${x} ${y})"><ellipse cx="0" cy="6" rx="10" ry="8"/><circle cx="-11" cy="-6" r="4.5"/><circle cx="-4" cy="-11" r="4.5"/><circle cx="4" cy="-11" r="4.5"/><circle cx="11" cy="-6" r="4.5"/></g>`;
const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 10S-14 2 -14 -5a7 7 0 0 1 14 -3a7 7 0 0 1 14 3C14 2 0 10 0 10z" fill="${c}"/>`;
function tileCats() { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" stroke-linecap="round" stroke-linejoin="round"><rect width="240" height="240" fill="#ffe4ec"/>${catFace(66, 78, '#ffb86e', '#e98a3b')}${catFace(178, 190, '#d3d0e0', '#a29db8')}${paw(186, 62, '#ffc4d4')}${paw(58, 192, '#ffc4d4')}${heart(122, 132, 1.1, '#ff9fbd')}${heart(222, 118, .7, '#ffb3c7')}</svg>`; }
function dogFace(x, y, col, ear, patch) {
  return `<g transform="translate(${x} ${y})" stroke="${INK}" stroke-width="4"><ellipse cx="-40" cy="-4" rx="14" ry="28" fill="${ear}" transform="rotate(22 -40 -4)"/><ellipse cx="40" cy="-4" rx="14" ry="28" fill="${ear}" transform="rotate(-22 40 -4)"/>
  <ellipse rx="40" ry="36" fill="${col}"/>${patch ? `<ellipse cx="15" cy="-10" rx="14" ry="12" fill="${ear}" stroke="none"/>` : ''}${eye(-14, -7)}${eye(14, -7)}<ellipse cx="0" cy="13" rx="18" ry="13" fill="#fff6ea" stroke="none"/><ellipse cx="0" cy="6" rx="7.5" ry="5.5" fill="${INK}" stroke="none"/>
  <path d="M-5 20q5 13 10 0z" fill="#ff8fab" stroke-width="2.5"/><path d="M0 11v6M0 17q-6 6 -11 1M0 17q6 6 11 1" fill="none" stroke-width="3"/>${blush(-25, 10)}${blush(25, 10)}</g>`;
}
const bone = (x, y, r, c) => `<g transform="translate(${x} ${y}) rotate(${r})" fill="${c}"><rect x="-16" y="-5" width="32" height="10" rx="4"/><circle cx="-16" cy="-5" r="6"/><circle cx="-16" cy="5" r="6"/><circle cx="16" cy="-5" r="6"/><circle cx="16" cy="5" r="6"/></g>`;
function tileDogs() { return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" stroke-linecap="round" stroke-linejoin="round"><rect width="240" height="240" fill="#dcefff"/>${dogFace(66, 76, '#f3d2a2', '#b9814f')}${dogFace(178, 186, '#ffffff', '#6d5a52', true)}${bone(184, 62, -20, '#fff')}${bone(58, 190, 25, '#fff')}${paw(120, 132, '#bcdcf7')}</svg>`; }
function bunny(x, y, s, col) {
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="4"><ellipse cx="-14" cy="-92" rx="11" ry="34" fill="${col}" transform="rotate(-10 -14 -92)"/><ellipse cx="14" cy="-92" rx="11" ry="34" fill="${col}" transform="rotate(12 14 -92)"/><ellipse cx="-14" cy="-90" rx="5" ry="22" fill="#ffb3c7" stroke="none" transform="rotate(-10 -14 -90)"/><ellipse cx="14" cy="-90" rx="5" ry="22" fill="#ffb3c7" stroke="none" transform="rotate(12 14 -90)"/>
  <ellipse cx="0" cy="0" rx="42" ry="35" fill="${col}"/><circle cx="40" cy="8" r="12" fill="#fff"/><circle cx="0" cy="-50" r="30" fill="${col}"/>${eye(-11, -54, 5)}${eye(11, -54, 5)}<path d="M-4 -44h8l-4 5z" fill="#ff8fab" stroke="none"/><path d="M0 -39q-4 5 -8 1M0 -39q4 5 8 1" fill="none" stroke-width="3"/>${blush(-20, -42)}${blush(20, -42)}
  <ellipse cx="-20" cy="32" rx="15" ry="8" fill="${col}"/><ellipse cx="20" cy="32" rx="15" ry="8" fill="${col}"/></g>`;
}
const carrot = (x, y, r, s = 1.4) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" stroke="${INK}" stroke-width="3"><path d="M-6 -4C-14 -20 -6 -26 0 -14C4 -28 14 -22 6 -4" fill="#6dbb57"/><path d="M-12 0L0 46L12 0Z" fill="#ff9a3c"/><path d="M-6 14h6M-3 26h5" fill="none"/></g>`;
function sceneBunnies() { return wrap(meadowBase(17, 46) + bunny(470, 735, 1.5, '#ffffff') + bunny(800, 748, 1.6, '#e3bf98') + bunny(1130, 740, 1.35, '#cfcbdc') + carrot(640, 780, 20) + carrot(965, 790, -15) + carrot(1290, 778, 10)); }
function panda(x, y, s, bamboo) {
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="4"><ellipse cx="0" cy="0" rx="54" ry="46" fill="#fff"/><ellipse cx="-32" cy="38" rx="22" ry="14" fill="${INK}"/><ellipse cx="32" cy="38" rx="22" ry="14" fill="${INK}"/>
  ${bamboo ? `<rect x="30" y="-110" width="14" height="130" rx="5" fill="#7cc764" transform="rotate(18 37 -45)"/><ellipse cx="78" cy="-104" rx="26" ry="9" fill="#5cb553" transform="rotate(-30 78 -104)"/>` : ''}
  <ellipse cx="-46" cy="-8" rx="15" ry="26" fill="${INK}" transform="rotate(28 -46 -8)"/><ellipse cx="46" cy="-8" rx="15" ry="26" fill="${INK}" transform="rotate(-28 46 -8)"/>
  <circle cx="-30" cy="-92" r="14" fill="${INK}"/><circle cx="30" cy="-92" r="14" fill="${INK}"/><circle cx="0" cy="-58" r="42" fill="#fff"/>
  <ellipse cx="-16" cy="-62" rx="11" ry="15" fill="${INK}" stroke="none" transform="rotate(-28 -16 -62)"/><ellipse cx="16" cy="-62" rx="11" ry="15" fill="${INK}" stroke="none" transform="rotate(28 16 -62)"/>
  <circle cx="-14" cy="-63" r="4" fill="#fff" stroke="none"/><circle cx="14" cy="-63" r="4" fill="#fff" stroke="none"/><ellipse cx="0" cy="-46" rx="6.5" ry="4.5" fill="${INK}" stroke="none"/><path d="M0 -42q-5 6 -10 1M0 -42q5 6 10 1" fill="none" stroke-width="3"/>${blush(-26, -44)}${blush(26, -44)}</g>`;
}
function scenePandas() {
  const r = rnd(9); let bam = '';
  for (const x of [80, 170, 300, 1260, 1380, 1500, 1570]) {
    const w = 22 + r() * 10, top = 80 + r() * 200; bam += `<rect x="${x}" y="${top}" width="${w}" height="${900 - top}" fill="${r() > .5 ? '#7cc764' : '#8fd076'}"/>`;
    for (let y = top + 70; y < 860; y += 90 + r() * 40) bam += `<path d="M${x - 2} ${y}h${w + 4}" stroke="#4f9a45" stroke-width="5"/><ellipse cx="${x + w + 26}" cy="${y - 14}" rx="30" ry="9" fill="#5cb553" transform="rotate(-28 ${x + w + 26} ${y - 14})"/>`;
  }
  return wrap(`<defs>${lg('sk', [[0, '#e9f8e2'], [1, '#c9ecc0']])}</defs><rect width="1600" height="900" fill="url(#sk)"/>${cloud(560, 160, 1)}${cloud(1000, 110, .8)}
  <path d="M0 700C400 650 1100 690 1600 660V900H0Z" fill="#a6db8e"/>${bam}<path d="M0 790C400 760 1100 800 1600 770V900H0Z" fill="#8fcf74"/>
  ${panda(600, 715, 1.45, true)}${panda(985, 742, 1.15, false)}${panda(1235, 790, .72, false)}`);
}
function fish(x, y, s, col, st, flip) {
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" stroke="${INK}" stroke-width="4"><path d="M36 0L66 -22V22Z" fill="${col}"/><ellipse rx="44" ry="28" fill="${col}"/><path d="M4 -26C10 -10 10 10 4 26" fill="none" stroke="${st}" stroke-width="7"/><path d="M-10 -26L6 -40L16 -24" fill="${col}"/>${eye(-22, -6, 6)}<path d="M-36 8q5 4 10 0" fill="none" stroke-width="3"/></g>`;
}
function turtle(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="4"><ellipse cx="-60" cy="22" rx="26" ry="12" fill="#a8e08a" transform="rotate(30 -60 22)"/><ellipse cx="50" cy="26" rx="24" ry="11" fill="#a8e08a" transform="rotate(-30 50 26)"/><ellipse cx="-56" cy="-26" rx="30" ry="12" fill="#a8e08a" transform="rotate(-30 -56 -26)"/>
  <circle cx="-92" cy="-6" r="24" fill="#a8e08a"/>${eye(-100, -12, 5)}<path d="M-108 4q6 5 12 0" fill="none" stroke-width="3"/>${blush(-86, 4)}
  <ellipse cx="0" cy="0" rx="72" ry="46" fill="#6cc070"/><g fill="none" stroke="#3f8f4a" stroke-width="4"><path d="M-20 -24l16 -10l18 10v20l-18 10l-16 -10z"/><path d="M-20 -4l-26 -6M14 -4l26 -6M-4 6v24"/></g></g>`;
}
function crab(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="4"><path d="M-30 -10L-50 -40M30 -10L50 -40" fill="none"/><circle cx="-54" cy="-48" r="13" fill="#ff7b6b"/><circle cx="54" cy="-48" r="13" fill="#ff7b6b"/><path d="M-30 14l-24 16M30 14l24 16M-20 22l-14 20M20 22l14 20" fill="none"/>
  <ellipse rx="40" ry="26" fill="#ff7b6b"/><path d="M-12 -22v-14M12 -22v-14" fill="none"/>${eye(-12, -38, 6)}${eye(12, -38, 6)}<path d="M-8 4q8 7 16 0" fill="none" stroke-width="3"/>${blush(-24, 0)}${blush(24, 0)}</g>`;
}
function sceneSea() {
  const r = rnd(13); let bub = '', weed = '';
  for (let i = 0; i < 30; i++) bub += `<circle cx="${Math.round(r() * 1600)}" cy="${Math.round(60 + r() * 680)}" r="${(4 + r() * 12).toFixed(1)}" fill="#fff" fill-opacity=".18" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`;
  for (const x of [60, 120, 380, 1180, 1300, 1520]) { const hh = 160 + r() * 140; weed += `<path d="M${x} 880C${x - 30} ${880 - hh * .3} ${x + 30} ${880 - hh * .6} ${x} ${880 - hh}" fill="none" stroke="${r() > .5 ? '#3fae6a' : '#5cc27e'}" stroke-width="16"/>`; }
  return wrap(`<defs>${lg('sk', [[0, '#8be1f2'], [.55, '#2b9fcc'], [1, '#13689a']])}</defs><rect width="1600" height="900" fill="url(#sk)"/>
  <g fill="#fff" opacity=".1"><path d="M300 0H420L700 900H460Z"/><path d="M900 0H980L1180 900H1000Z"/></g>${bub}${weed}
  <path d="M0 830C400 800 1000 850 1600 815V900H0Z" fill="#f2d39b"/>
  <g stroke="${INK}" stroke-width="4"><path d="M240 840C230 780 250 740 220 700M240 840C260 790 300 770 300 720M240 840C250 800 210 780 180 760" fill="none" stroke="#ff8a8a" stroke-width="16"/><path d="M1420 835C1410 790 1440 760 1430 720M1420 835C1440 800 1480 790 1490 760" fill="none" stroke="#ffb36b" stroke-width="16"/></g>
  ${fish(420, 290, 1.4, '#ffd166', '#ff9f43')}${fish(1230, 220, 1.15, '#ff8fb1', '#ff5d8f', true)}${fish(1380, 340, .85, '#a99cff', '#7b6cf0', true)}${fish(250, 540, 1, '#7ee0c3', '#3fbf9a')}
  ${turtle(840, 470, 1.6)}${crab(1010, 790, 1.3)}`);
}
function penguin(x, y, s, scarf) {
  return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="4"><ellipse cx="-18" cy="52" rx="14" ry="7" fill="#ffa23a"/><ellipse cx="18" cy="52" rx="14" ry="7" fill="#ffa23a"/>
  <ellipse cx="-38" cy="6" rx="12" ry="28" fill="#2b3150" transform="rotate(20 -38 6)"/><ellipse cx="38" cy="6" rx="12" ry="28" fill="#2b3150" transform="rotate(-20 38 6)"/>
  <ellipse cx="0" cy="0" rx="40" ry="54" fill="#2b3150"/><path d="M0 -26C-30 -44 -34 -6 -26 14C-20 36 20 36 26 14C34 -6 30 -44 0 -26Z" fill="#fff" stroke="none"/>
  ${eye(-12, -22, 5)}${eye(12, -22, 5)}<path d="M-7 -12h14l-7 9z" fill="#ffa23a" stroke-width="3"/>${blush(-20, -8)}${blush(20, -8)}
  ${scarf ? `<path d="M-34 -2C-10 8 10 8 34 -2V10C10 20 -10 20 -34 10Z" fill="#ff6b7d" stroke-width="3"/><rect x="12" y="8" width="14" height="30" rx="4" fill="#ff6b7d" stroke-width="3"/>` : ''}</g>`;
}
function scenePenguins() {
  const r = rnd(29); let snow = '';
  for (let i = 0; i < 70; i++) snow += `<circle cx="${Math.round(r() * 1600)}" cy="${Math.round(r() * 640)}" r="${(2 + r() * 4).toFixed(1)}" fill="#fff" opacity="${(.6 + r() * .4).toFixed(2)}"/>`;
  return wrap(`<defs>${lg('sk', [[0, '#8fcdf0'], [1, '#e6f6ff']])}</defs><rect width="1600" height="900" fill="url(#sk)"/>${snow}${cloud(400, 140, 1)}${cloud(1200, 180, 1.2)}
  <path d="M120 640L220 470L300 560L380 500L480 640Z" fill="#e6f5ff" stroke="#b6dcf2" stroke-width="4"/><path d="M1100 640L1210 450L1290 520L1350 480L1460 640Z" fill="#e6f5ff" stroke="#b6dcf2" stroke-width="4"/>
  <rect y="630" width="1600" height="90" fill="#6fc0e6"/><g stroke="#fff" stroke-width="4" opacity=".6"><path d="M200 670h90M640 690h120M1200 665h80"/></g>
  <path d="M0 720C300 700 700 735 1000 720C1300 705 1450 728 1600 716V900H0Z" fill="#fff"/><path d="M0 760C400 740 1000 790 1600 760" fill="none" stroke="#d6edf9" stroke-width="6"/>
  ${penguin(560, 735, 1.6, true)}${penguin(830, 752, 1.35)}${penguin(1080, 742, 1.5)}${penguin(955, 805, .75)}`);
}

/* ---------- Bright scenes: flat sky blue and lime with bold dark outlines ---------- */
const BI = '#1d1b33';
const bCloud = (x, y, k) => `<path transform="translate(${x} ${y}) scale(${k})" d="M-86 22C-118 22 -118 -18 -84 -20C-80 -54 -34 -62 -16 -38C-2 -70 54 -68 60 -28C96 -32 104 20 72 22Z" fill="#fff" stroke="${BI}" stroke-width="${(5 / k).toFixed(2)}"/>`;
const bSun = (x, y, r) => { let g = ''; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g += `<path d="M${(x + Math.cos(a) * (r + 18)).toFixed(1)} ${(y + Math.sin(a) * (r + 18)).toFixed(1)}L${(x + Math.cos(a) * (r + 40)).toFixed(1)} ${(y + Math.sin(a) * (r + 40)).toFixed(1)}"/>`; } return `<g stroke="${BI}" stroke-width="5">${g}</g><circle cx="${x}" cy="${y}" r="${r}" fill="#ffd84d" stroke="${BI}" stroke-width="5"/><path d="M${x - r * .55} ${y - r * .1}a${r * .55} ${r * .55} 0 0 1 ${r * .35} -${r * .42}" fill="none" stroke="#fff" stroke-width="7" opacity=".8"/>`; };
const bFlower = (x, y, r, col) => { let p = ''; for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.5708; p += `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${(r * .72).toFixed(1)}"/>`; } return `<path d="M${x} ${y + r}v${r * 2.6}" stroke="${BI}" stroke-width="4"/><g fill="${col}" stroke="${BI}" stroke-width="3.5">${p}</g><circle cx="${x}" cy="${y}" r="${(r * .55).toFixed(1)}" fill="#ffd84d" stroke="${BI}" stroke-width="3.5"/>`; };
const bTuft = (x, y) => `<path d="M${x} ${y}q5 -16 10 0q5 -18 10 0q5 -14 10 0" fill="none" stroke="${BI}" stroke-width="4"/>`;
const bBalloon = (x, y, col, sx, sy) => `<path d="M${x} ${y + 44}C${x + 4} ${y + 80} ${sx - 10} ${sy - 50} ${sx} ${sy}" fill="none" stroke="${BI}" stroke-width="3"/><path d="M${x - 7} ${y + 50}L${x} ${y + 40}L${x + 7} ${y + 50}Z" fill="${col}" stroke="${BI}" stroke-width="3.5"/><ellipse cx="${x}" cy="${y}" rx="36" ry="44" fill="${col}" stroke="${BI}" stroke-width="5"/><path d="M${x - 20} ${y - 14}q4 -16 18 -22" fill="none" stroke="#fff" stroke-width="6" opacity=".85"/>`;
const bTree = (x, y, h, col) => `<path d="M${x - 9} ${y}V${y - h * .5}h18V${y}Z" fill="#b5713f" stroke="${BI}" stroke-width="5"/><circle cx="${x}" cy="${y - h * .72}" r="${h * .34}" fill="${col}" stroke="${BI}" stroke-width="5"/><path d="M${x - h * .18} ${y - h * .86}q${h * .08} -${h * .1} ${h * .2} -${h * .1}" fill="none" stroke="#fff" stroke-width="6" opacity=".6"/>`;
function brightGround(seed, y1, y2, n) {
  const r = rnd(seed); let d = '';
  for (let i = 0; i < n; i++) { const x = Math.round(40 + r() * 1520), y = Math.round(y2 + 30 + r() * 120); d += i % 3 ? bTuft(x, y) : bFlower(x, y - 16, 7 + r() * 3, ['#ff94b8', '#fff', '#b49cff'][i % 3 === 0 ? (i / 3) % 3 : 0]); }
  return `<path d="M0 ${y1}C260 ${y1 - 70} 540 ${y1 - 50} 780 ${y1 - 4}C1020 ${y1 + 42} 1280 ${y1 - 60} 1600 ${y1 - 34}V900H0Z" fill="#b1db63"/>
  <path d="M0 ${y2}C320 ${y2 - 54} 640 ${y2 - 8} 920 ${y2}C1200 ${y2 + 8} 1420 ${y2 - 44} 1600 ${y2 - 28}V900H0Z" fill="#c6e77e"/>${d}`;
}
function sceneBrHills() {
  return wrap(`<rect width="1600" height="900" fill="#bfe6fb"/>${bSun(1380, 160, 62)}
  ${bCloud(330, 170, 1.1)}${bCloud(820, 120, .85)}${bCloud(1080, 280, .7)}
  <g transform="translate(1120 210) rotate(-14)"><path d="M0 120C-20 170 30 200 10 250C-6 290 30 320 20 360" fill="none" stroke="${BI}" stroke-width="3"/>
  <path d="M-8 180l16 -8l-2 18z M2 262l18 -6l-4 18z" fill="#ffd84d" stroke="${BI}" stroke-width="3"/>
  <path d="M0 -70L50 0L0 120L-50 0Z" fill="#ff94b8" stroke="${BI}" stroke-width="5"/><path d="M0 -70V120M-50 0H50" stroke="${BI}" stroke-width="3.5"/><path d="M0 -70L50 0L0 0Z" fill="#b49cff" stroke="${BI}" stroke-width="3.5"/></g>
  ${bBalloon(190, 330, '#ffd84d', 240, 560)}${bBalloon(262, 300, '#b49cff', 240, 560)}${bBalloon(236, 392, '#ff94b8', 240, 560)}
  ${brightGround(21, 640, 730, 30)}`);
}
function sceneBrPark() {
  return wrap(`<rect width="1600" height="900" fill="#bfe6fb"/>${bSun(220, 170, 56)}${bCloud(640, 150, 1)}${bCloud(1240, 120, 1.15)}${bCloud(1480, 300, .6)}
  <path d="M0 610C400 570 1200 570 1600 600V900H0Z" fill="#b1db63"/>
  ${bTree(120, 650, 220, '#8fd14f')}${bTree(330, 640, 160, '#6fc24a')}${bTree(1290, 640, 190, '#8fd14f')}${bTree(1480, 655, 240, '#6fc24a')}
  <path d="M0 690C340 650 1260 650 1600 680V900H0Z" fill="#c6e77e"/>
  <path d="M782 690C774 760 712 830 640 900H960C892 830 830 760 822 690Z" fill="#f3e2c0" stroke="${BI}" stroke-width="5"/>
  ${(() => { const r = rnd(33); let d = ''; for (let i = 0; i < 26; i++) { const x = Math.round(30 + r() * 1540); if (x > 620 && x < 980) continue; d += i % 2 ? bTuft(x, Math.round(730 + r() * 140)) : bFlower(x, Math.round(720 + r() * 130), 7 + r() * 3, ['#ff94b8', '#fff', '#ffae5e', '#b49cff'][i % 4]); } return d; })()}`);
}
function tileBrConfetti() {
  return wrap(`<rect width="400" height="400" fill="#bfe6fb"/>
  <g stroke="${BI}" stroke-width="4">
  <path d="M70 46l8 16 18 3-13 12 3 18-16-8-16 8 3-18-13-12 18-3z" fill="#ffd84d"/>
  <circle cx="300" cy="80" r="14" fill="#ff94b8"/>
  <path d="M236 248l32 7-22 25z" fill="#c6e77e"/>
  <rect x="70" y="270" width="28" height="28" rx="7" transform="rotate(18 84 284)" fill="#b49cff"/>
  <path d="M170 150q10 -12 20 0t20 0" fill="none" stroke="#ff3d7f" stroke-width="6"/>
  <path d="M320 336q9 -10 18 0" fill="none" stroke="#7a4dff" stroke-width="5"/>
  <circle cx="356" cy="210" r="9" fill="#ffae5e"/></g>
  <g fill="${BI}"><circle cx="200" cy="44" r="4"/><circle cx="34" cy="180" r="3.5"/><circle cx="160" cy="350" r="4"/><circle cx="380" cy="380" r="3"/></g>`, 400, 400);
}
const SCENES = {
  brhills: ['Sky and hills', 'bright', '#bfe6fb', sceneBrHills], brpark: ['Sunny park', 'bright', '#bfe6fb', sceneBrPark], brconfetti: ['Confetti', 'bright', '#bfe6fb', tileBrConfetti, true],
  mountains: ['Mountain lake', 'nature', '#8ccbf0', sceneMountains], meadow: ['Spring meadow', 'nature', '#9fdcfa', sceneMeadow],
  desert: ['Desert sunset', 'nature', '#c56b8f', sceneDesert], beach: ['Beach', 'nature', '#7fd3fb', sceneBeach],
  forest: ['Forest', 'nature', '#cdeedb', sceneForest], night: ['Starry night', 'nature', '#0e1440', sceneNight],
  cats: ['Kittens', 'animals', '#ffe4ec', tileCats, true], dogs: ['Puppies', 'animals', '#dcefff', tileDogs, true],
  bunnies: ['Bunnies', 'animals', '#9fdcfa', sceneBunnies], pandas: ['Pandas', 'animals', '#e9f8e2', scenePandas],
  sea: ['Sea friends', 'animals', '#2b9fcc', sceneSea], penguins: ['Penguins', 'animals', '#8fcdf0', scenePenguins],
};
const _sceneUri = {};
function sceneCss(k, thumb) {
  const sc = SCENES[k]; if (!sc) return '';
  const uri = _sceneUri[k] || (_sceneUri[k] = 'url("data:image/svg+xml,' + encodeURIComponent(sc[3]()) + '")');
  return sc[4] ? `${uri} 0 0 / ${thumb ? '4.5rem 4.5rem' : '15rem 15rem'} repeat ${sc[2]}` : `${uri} center bottom / cover no-repeat ${sc[2]}`;
}

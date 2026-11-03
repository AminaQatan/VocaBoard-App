/* ---------- Icons (original drawings) ---------- */
const I = {
  attend:`<rect class="f-card" x="7" y="7" width="34" height="36" rx="6"/><rect class="f-lav" x="16" y="3.5" width="16" height="8" rx="3"/><circle class="f-butter" cx="18" cy="23" r="5"/><path d="M10.5 36c1.2-5.6 13.8-5.6 15 0"/><path d="M28.5 22.5l3.2 3.2 6.3-7" stroke-width="3.2"/><path d="M29 33h8"/>`,
  shapes:`<rect class="f-lav" x="5" y="22" width="19" height="19" rx="3"/><circle class="f-pink" cx="33" cy="15" r="9"/><path class="f-mint" d="M34 25l9.5 16h-19z"/>`,
  note:`<path class="f-butter" d="M7 8h34v23L30 42H7z"/><path class="f-peach" d="M30 42V31h11z"/><path d="M13 17h20M13 24h14"/>`,
  autodraw:`<path d="M6 41c4-3 8-3 11-1s7 2 10-1"/><path class="f-card" d="M30 11l7 7-15 15h-7v-7z"/><path class="f-lav" d="M30 11l3-3a2 2 0 0 1 2.8 0l4.2 4.2a2 2 0 0 1 0 2.8l-3 3z"/><path class="f-butter" d="M11 5l1.6 3.4L16 10l-3.4 1.6L11 15l-1.6-3.4L6 10l3.4-1.6z" stroke-width="2"/><path class="f-butter" d="M40 27l1.2 2.6L44 31l-2.8 1.2L40 35l-1.2-2.8L36 31l2.8-1.4z" stroke-width="2"/>`,
  hangman:`<path d="M7 42h20M13 42V6h19v6" /><path d="M13 14l8-8"/><circle class="f-pink" cx="32" cy="17" r="5"/><path d="M32 22v9M32 25l-5 4.5M32 25l5 4.5M32 31l-4 6M32 31l4 6"/><rect class="f-butter" x="28" y="40" width="7" height="5" rx="1.5" stroke-width="2"/><rect class="f-mint" x="37" y="40" width="7" height="5" rx="1.5" stroke-width="2"/>`,
  chess:`<path class="f-card" d="M12 43h24v-5H12z"/><path class="f-lav" d="M15 38c0-8 6-11 6-16l-6 2-3-4 9-12c9 0 15 7 15 17v13z"/><circle class="f-ink" cx="22" cy="17" r="1.8" stroke="none"/>`,
  wall:`<rect class="f-card" x="5" y="6" width="38" height="36" rx="6"/><rect class="f-butter" x="10" y="12" width="12" height="11" rx="2" stroke-width="2.4"/><rect class="f-mint" x="26" y="12" width="12" height="16" rx="2" stroke-width="2.4"/><rect class="f-pink" x="10" y="27" width="12" height="10" rx="2" stroke-width="2.4"/><rect class="f-aqua" x="26" y="32" width="12" height="5" rx="2" stroke-width="2.4"/>`,
  room:`<rect class="f-card" x="5" y="7" width="38" height="34" rx="3"/><path d="M5 22h11M26 7v12"/><rect class="f-peach" x="27" y="26" width="11" height="9" rx="2" stroke-width="2.4"/><circle class="f-mint" cx="14" cy="32" r="4" stroke-width="2.4"/><rect class="f-lav" x="10" y="11" width="10" height="6" rx="1.5" stroke-width="2.4"/>`,
  background:`<path class="f-card" d="M24 6C13.5 6 6 13.4 6 23s7.6 18 16.5 18c3 0 4-2.2 3-4.6-1-2.4.4-4.4 3-4.4H33c5.4 0 9-3.8 9-9.4C42 13 34.2 6 24 6z"/><circle class="f-lav" cx="15" cy="21" r="3.2"/><circle class="f-mint" cx="21" cy="13.5" r="3.2"/><circle class="f-aqua" cx="30" cy="13.5" r="3.2"/><circle class="f-pink" cx="35" cy="21.5" r="3.2"/>`,
  poll:`<rect class="f-mint" x="7" y="7" width="24" height="9" rx="3.5"/><rect class="f-lav" x="7" y="20" width="34" height="9" rx="3.5"/><rect class="f-pink" x="7" y="33" width="16" height="9" rx="3.5"/>`,
  randomizer:`<rect class="f-aqua" x="17" y="12" width="24" height="29" rx="5"/><rect class="f-card" x="7" y="7" width="24" height="29" rx="5"/><circle cx="19" cy="17.5" r="4"/><path d="M12.5 30c1-4.5 12-4.5 13 0"/><path d="M37 5l1.2 2.8L41 9l-2.8 1.2L37 13l-1.2-2.8L33 9l2.8-1.2z" class="f-butter" stroke-width="2"/>`,
  sound:`<rect class="f-card" x="5" y="7" width="38" height="27" rx="6"/><path d="M12.5 28a11.5 11.5 0 0 1 23 0"/><path d="M24 28l6.5-7.5"/><circle class="f-pink" cx="24" cy="28" r="3"/><path d="M15 15.5l1 1.2M24 12v1.6M33 15.5l-1 1.2"/><path d="M6 42.5c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-5 5-5 2.5 5 5 5 2.5-3 5-3 2.5 3 5 3"/>`,
  image:`<rect class="f-card" x="5" y="9" width="38" height="31" rx="6" stroke="none"/><path class="f-lav" d="M6 36l11-11 8 8 6-6 11 11v2H6z" stroke="none"/><path d="M6 35l11-11 8 8 6-6 11 11"/><circle class="f-butter" cx="15" cy="18" r="3.5"/><rect x="5" y="9" width="38" height="31" rx="6"/>`,
  text:`<path class="f-card" d="M11 5h19l9 9v25a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4z"/><path class="f-butter" d="M30 5v9h9z"/><path d="M12.5 34l5.5-15 5.5 15M14.5 28.5h7"/><circle cx="30.5" cy="30.2" r="3.8"/><path d="M34.3 26.4V34"/>`,
  work:`<path class="f-lav" d="M5 19a6 6 0 0 1 6-6h15a6 6 0 0 1 6 6v7a6 6 0 0 1-6 6h-9l-7 6v-6.3A6 6 0 0 1 5 26z"/><path d="M12 20.5h12M12 25.5h7"/><path class="f-card" d="M33 4.5c3-1.6 7 .2 7.4 3.6 2.6.6 3.6 4 1.7 6-.9 1-2.2 1.5-3.6 1.4-1.4 1.6-4.2 1.6-5.6 0-2.4.3-4.2-2.3-3.1-4.4-1.4-2.4.6-5.4 3.2-6.6z"/><circle cx="40" cy="21" r="1.8"/><circle cx="43.5" cy="25.5" r="1.2"/>`,
  traffic:`<rect class="f-card" x="15" y="4" width="18" height="40" rx="7"/><circle class="f-pink" cx="24" cy="13" r="4"/><circle class="f-butter" cx="24" cy="24" r="4"/><circle class="f-mint" cx="24" cy="35" r="4"/>`,
  timetable:`<rect class="f-card" x="6" y="6" width="36" height="36" rx="7"/><path d="M12 15h9M12 24h7M12 33h9"/><circle class="f-aqua" cx="32" cy="15" r="5"/><path d="M29.7 15.1l1.6 1.6 3-3.3" stroke-width="2.4"/><circle class="f-lav" cx="32" cy="32" r="6"/><path d="M32 29v3.2l2 1.8" stroke-width="2.4"/>`,
  timer:`<path class="f-card" d="M14 6h20v5c0 6-7 9-7 13s7 7 7 13v5H14v-5c0-6 7-9 7-13s-7-7-7-13z"/><path class="f-butter" d="M17.5 40c0-4 6.5-5.5 6.5-8.5 0 3 6.5 4.5 6.5 8.5z" stroke="none"/><path class="f-butter" d="M19 15h10c-1 2.5-5 4.5-5 6.5 0-2-4-4-5-6.5z" stroke="none"/><path d="M11 6h26M11 42h26"/>`,
  clock:`<circle class="f-card" cx="24" cy="24" r="18"/><path d="M24 12.5V24l7-5.5"/><circle class="f-pink" cx="24" cy="24" r="3"/><path d="M24 8v1.5M24 38.5V40M8 24h1.5M38.5 24H40M12.7 12.7l1 1M34.3 34.3l1 1M35.3 12.7l-1 1M12.7 35.3l1-1"/>`,
  scoreboard:`<rect class="f-card" x="5" y="10" width="38" height="30" rx="5"/><path class="f-butter" d="M10 10h14v30H10a5 5 0 0 1-5-5V15a5 5 0 0 1 5-5z"/><path d="M24 10v30M14 5.5v8M34 5.5v8"/><path d="M11 21c0-3.5 7.5-4 7.5.2 0 3.3-7.5 6-7.5 10.3h7.5"/><path d="M30.5 20.5l3.5-2.5v14"/>`,
  stickers:`<path class="f-card" d="M24 41A17 17 0 1 1 41 24z"/><path class="f-lav" d="M41 24L24 41c.6-9.5 7.5-16.4 17-17z"/><path class="f-pink" d="M22.5 31.5s-7.5-4.6-7.5-9.4a4.2 4.2 0 0 1 7.5-2.6 4.2 4.2 0 0 1 7.5 2.6c0 4.8-7.5 9.4-7.5 9.4z"/>`,
  pdf:`<path class="f-card" d="M12 5h17l8 8v25a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5V10a5 5 0 0 1 5-5z"/><path class="f-pink" d="M7 31h30v7a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5z"/><path d="M13 13h10M13 19h16M13 25h12"/>`,
  groups:`<rect class="f-card" x="5" y="8" width="30" height="27" rx="5"/><circle cx="15.5" cy="18" r="3.6"/><circle cx="25" cy="18" r="3.6"/><path d="M9.5 29.5c.8-4.5 11.2-4.5 12 0M19 29.5c.8-4.5 11.2-4.5 12 0"/><circle class="f-mint" cx="36" cy="35" r="8"/><path d="M36 31v8M32 35h8"/>`,
  video:`<rect class="f-card" x="5" y="9" width="38" height="29" rx="6"/><path class="f-lav" d="M20 15l9.5 6-9.5 6z"/><path d="M11 33h26"/><circle class="f-card" cx="28" cy="33" r="2.6"/>`,
  dice:`<rect class="f-lav" x="20" y="5" width="23" height="23" rx="6"/><circle class="f-ink" cx="36.5" cy="11.5" r="1.6" stroke="none"/><rect class="f-card" x="5" y="18" width="25" height="25" rx="6"/><g class="f-ink" stroke="none"><circle cx="12" cy="25" r="2"/><circle cx="23" cy="25" r="2"/><circle cx="17.5" cy="30.5" r="2"/><circle cx="12" cy="36" r="2"/><circle cx="23" cy="36" r="2"/></g>`,
  webcam:`<circle class="f-card" cx="24" cy="21" r="15"/><circle class="f-aqua" cx="24" cy="21" r="8"/><circle cx="24" cy="21" r="3"/><path d="M16 43h16M24 36v7"/><circle class="f-ink" cx="24" cy="9.5" r="1" stroke="none"/>`,
  vtimer:`<circle class="f-card" cx="24" cy="25" r="18"/><path class="f-lav" d="M24 25V11a14 14 0 0 0-12.1 7z"/><path d="M24 7v2M24 41v2M6 25h2M40 25h2M33 13l-1 1.4M36.5 34l-1.4-.8M15 37l1-1.5"/>`,
  calendar:`<rect class="f-card" x="6" y="9" width="36" height="33" rx="6"/><path class="f-pink" d="M12 9h24a6 6 0 0 1 6 6v4H6v-4a6 6 0 0 1 6-6z"/><path d="M16 5v8M32 5v8"/><path d="M14 27h.01M21 27h.01M28 27h.01M35 27h.01M14 34.5h.01M21 34.5h.01M28 34.5h.01" stroke-width="3.6"/>`,
  countdown:`<rect class="f-card" x="5" y="11" width="34" height="31" rx="6"/><path class="f-mint" d="M5 34h34v2a6 6 0 0 1-6 6H11a6 6 0 0 1-6-6z"/><path d="M12 19.5h5.5l-3.4 4.1c2.6-.6 4.2 1 4.2 2.8 0 2.8-3.9 3.7-6.3 1.8"/><path d="M28.5 19.5h-4.5l-.8 4.8c2.9-1.3 5.3.2 5.3 2.5 0 2.7-3.8 3.6-6 1.7"/><path d="M41 4v17"/><path class="f-butter" d="M41 4.5l6 3-6 3"/>`,
  stopwatch:`<circle class="f-card" cx="24" cy="27" r="16"/><path d="M19.5 5h9M24 5v6M37.5 14.5l2.8-2.8"/><path d="M24 27l6-6"/><circle class="f-pink" cx="24" cy="27" r="2.6"/>`,
  draw:`<path d="M6 41c4-3 8-3 11-1s7 2 10-1"/><path class="f-card" d="M31 9l8 8-17 17h-8v-8z"/><path class="f-pink" d="M31 9l3.5-3.5a2 2 0 0 1 2.8 0l5.2 5.2a2 2 0 0 1 0 2.8L39 17z"/>`,
  embed:`<rect class="f-card" x="5" y="8" width="38" height="32" rx="6"/><path class="f-aqua" d="M11 8h26a6 6 0 0 1 6 6v3.5H5V14a6 6 0 0 1 6-6z"/><path d="M11 12.8h.01M15.5 12.8h.01M20 12.8h.01" stroke-width="3.4"/><path d="M17 24.5l-5 5 5 5M31 24.5l5 5-5 5M26.5 22.5l-5 14"/>`,
  link:`<rect class="f-card" x="5" y="10" width="30" height="30" rx="7"/><path d="M17.5 27.5l5-5"/><path d="M21 19l2.3-2.3a4.7 4.7 0 0 1 6.6 6.6L27.6 25.6M19 31l-2.3 2.3a4.7 4.7 0 0 1-6.6-6.6l2.3-2.3"/><circle class="f-mint" cx="37" cy="11" r="7"/><path d="M34.3 13.7l5-5M35.3 8.7h4v4" stroke-width="2.4"/>`,
  qr:`<rect class="f-card" x="7" y="7" width="13" height="13" rx="3"/><rect class="f-aqua" x="11.5" y="11.5" width="4" height="4" rx="1" stroke="none"/><rect class="f-card" x="28" y="7" width="13" height="13" rx="3"/><rect class="f-aqua" x="32.5" y="11.5" width="4" height="4" rx="1" stroke="none"/><rect class="f-card" x="7" y="28" width="13" height="13" rx="3"/><rect class="f-aqua" x="11.5" y="32.5" width="4" height="4" rx="1" stroke="none"/><path d="M28 28h5v5M41 28v4M33.5 41H41v-4M28 37.5V41"/>`,
  wheel:`<circle class="f-card" cx="24" cy="26" r="17"/><path class="f-pink" d="M24 26V9a17 17 0 0 1 14.7 8.5z"/><path class="f-mint" d="M24 26l14.7-8.5A17 17 0 0 1 38.7 34.5z"/><path class="f-butter" d="M24 26l14.7 8.5A17 17 0 0 1 24 43z"/><path class="f-lav" d="M24 26v17A17 17 0 0 1 9.3 34.5z"/><circle class="f-card" cx="24" cy="26" r="3.6"/><path class="f-ink" d="M20 3.5h8L24 10z" stroke-width="2"/>`,
  speech:`<rect class="f-card" x="8" y="5" width="32" height="13" rx="6.5"/><circle class="f-mint" cx="15.5" cy="11.5" r="3" stroke-width="2.4"/><circle class="f-butter" cx="24" cy="11.5" r="3" stroke-width="2.4"/><circle class="f-pink" cx="32.5" cy="11.5" r="3" stroke-width="2.4"/><rect class="f-lav" x="19" y="21" width="10" height="13" rx="5"/><path d="M14 30a10 10 0 0 0 20 0M24 40v3M17 43h14"/>`,
  calc:`<rect class="f-card" x="9" y="4" width="30" height="40" rx="6"/><rect class="f-aqua" x="14" y="9" width="20" height="9" rx="2.5" stroke-width="2.4"/><path d="M16 25h.01M24 25h.01M32 25h.01M16 31.5h.01M24 31.5h.01M16 38h.01M24 38h.01" stroke-width="3.8"/><rect class="f-pink" x="29.5" y="29.5" width="5" height="10.5" rx="2" stroke-width="2.4"/>`,
  tongue:`<path class="f-card" d="M7 21c0-9 7.6-15 17-15s17 6 17 15-7.6 16-17 16S7 30 7 21z"/><path class="f-ink" d="M14 20c3 6.5 17 6.5 20 0z" stroke-width="2.4"/><path class="f-pink" d="M19.5 24.5c0 6 2 10 4.5 10s4.5-4 4.5-10z" stroke-width="2.4"/><path d="M3 41l4-3M9 44l2-4M45 41l-4-3M39 44l-2-4"/>`,
  family:`<rect class="f-butter" x="15" y="4" width="18" height="10" rx="3"/><path d="M24 14v6M9 20h30M9 20v5M24 20v5M39 20v5"/><rect class="f-lav" x="3" y="25" width="12" height="9" rx="2.5" stroke-width="2.4"/><rect class="f-mint" x="18" y="25" width="12" height="9" rx="2.5" stroke-width="2.4"/><rect class="f-pink" x="33" y="25" width="12" height="9" rx="2.5" stroke-width="2.4"/><path d="M9 34v4M24 34v4M39 34v4M5.5 42h7M20.5 42h7M35.5 42h7" stroke-width="2.4"/>`,
  dict:`<path class="f-card" d="M9 7a4 4 0 0 1 4-4h24v35H13a4 4 0 0 0-4 4z"/><path class="f-aqua" d="M9 42a4 4 0 0 1 4-4h24v6H13a4 4 0 0 1-4-2z"/><path d="M15 26l5-14 5 14M16.8 21.5h6.4"/><circle class="f-butter" cx="33.5" cy="31" r="6.5"/><path d="M38.2 35.7L44 41.5"/>`,
  mindmap:`<path d="M24 24L9 11M24 24l15-13M24 24L9 37M24 24l15 13"/><circle class="f-lav" cx="9" cy="11" r="5" stroke-width="2.4"/><circle class="f-mint" cx="39" cy="11" r="5" stroke-width="2.4"/><circle class="f-pink" cx="9" cy="37" r="5" stroke-width="2.4"/><circle class="f-aqua" cx="39" cy="37" r="5" stroke-width="2.4"/><rect class="f-butter" x="15" y="18" width="18" height="12" rx="6"/>`,
  exit:`<path class="f-card" d="M5 13a3 3 0 0 1 3-3h32a3 3 0 0 1 3 3v6a5 5 0 0 0 0 10v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6a5 5 0 0 0 0-10z"/><path d="M31 10v28" stroke-dasharray="2.5 3"/><path class="f-mint" d="M12 25.5l3.5 3.5 7-7.5" fill="none"/><circle class="f-butter" cx="37.5" cy="24" r="2.6" stroke-width="2.2"/>`,
};
const U = {
  rotate:`<path d="M19.5 12A7.5 7.5 0 1 1 17.3 6.7"/><path d="M19.5 4v4.5H15"/>`,
  fill:`<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 13L13 4M8 20L20 8M14 20l6-6" opacity=".7"/>`,
  spell:`<path d="M3 15.5L6.6 6l3.6 9.5M4.3 12.4h4.6"/><path d="M12.5 13.5l3 3L21 9"/>`,
  wand:`<path d="M4 20L14.5 9.5"/><path d="M13 8l3 3"/><path d="M18 3v3M21 6h-3M15 4.5l1 1M20.5 9.5l-1-1" stroke-width="1.8"/>`,
  shp:`<rect x="3" y="12.5" width="8" height="8" rx="1"/><circle cx="17" cy="7" r="4"/><path d="M17 13l4 7.5h-8z"/>`,
  hw:`<path d="M3 16c2.5-6 4.5-9 6.5-6.5S8 18 10.5 18s3.5-9 6.5-9 2 6.5 4 6.5"/>`,
  heartsm:`<path d="M12 20s-8-4.8-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.2 12 20 12 20z" fill="currentColor"/>`,
  srect:`<rect x="4" y="6" width="16" height="12" rx="1"/>`,
  sellipse:`<ellipse cx="12" cy="12" rx="8.5" ry="6.5"/>`,
  stri:`<path d="M12 4.5l8.5 15h-17z"/>`,
  sdiamond:`<path d="M12 3l8 9-8 9-8-9z"/>`,
  sstar:`<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z"/>`,
  sheart:`<path d="M12 20s-8-4.8-8-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.8C20 15.2 12 20 12 20z"/>`,
  line:`<path d="M5 19L19 5"/>`,
  arrow:`<path d="M5 19L19 5M10 5h9v9"/>`,
  x:`<path d="M6 6l12 12M18 6L6 18"/>`,
  edit:`<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>`,
  check:`<path d="M5 12.5l4.5 4.5L19 7"/>`,
  max:`<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>`,
  min:`<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>`,
  plus:`<path d="M12 5v14M5 12h14"/>`,
  minus:`<path d="M5 12h14"/>`,
  play:`<path d="M8 5.5l11 6.5-11 6.5z" fill="currentColor"/>`,
  pause:`<path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="3"/>`,
  stop:`<rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/>`,
  reset:`<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>`,
  left:`<path d="M15 5l-7 7 7 7"/>`,
  right:`<path d="M9 5l7 7-7 7"/>`,
  up:`<path d="M5 15l7-7 7 7"/>`,
  down:`<path d="M5 9l7 7 7-7"/>`,
  dockhide:`<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 15.5h18M9 8.5l3 3 3-3"/>`,
  menu:`<path d="M4 7h16M4 12h16M4 17h10"/>`,
  fs:`<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>`,
  trash:`<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>`,
  upload:`<path d="M12 15V4M7 9l5-5 5 5M4 15v5h16v-5"/>`,
  download:`<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>`,
  eye:`<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>`,
  eyeoff:`<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.7M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4.4-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>`,
  undo:`<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>`,
  copy:`<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>`,
  out:`<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>`,
  shuffle:`<path d="M3 7h3.5c2 0 3 1 4.5 3l2 4c1.5 2 2.5 3 4.5 3H21M18 4l3 3-3 3M3 17h3.5c1.4 0 2.3-.5 3.2-1.4M14 8.4c.9-.9 1.8-1.4 3.2-1.4M18 14l3 3-3 3"/>`,
  mic:`<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>`,
  cam:`<path d="M3 8a2 2 0 0 1 2-2h2.5l1.5-2h6l1.5 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.5"/>`,
  flip:`<path d="M12 3v18" stroke-dasharray="2 2.5"/><path d="M8.5 7L3 12l5.5 5zM15.5 7l5.5 5-5.5 5z"/>`,
  swap:`<path d="M4 8h13l-3-3M20 16H7l3 3"/>`,
  pen:`<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/>`,
  hl:`<path d="M9 15l-3 3v2h4l3-3M9 15l7.5-9.5a2 2 0 0 1 3 2.6L13 17z"/><path d="M5 22h14" opacity=".5"/>`,
  eraser:`<path d="M8 20h12M5.6 15.6l8.5-8.5a2 2 0 0 1 2.8 0l2 2a2 2 0 0 1 0 2.8L12.4 18.4a2 2 0 0 1-1.4.6H8.6a2 2 0 0 1-1.4-.6l-1.6-1.6a.9.9 0 0 1 0-1.2zM10 11l5 5"/>`,
  flag:`<path d="M5 21V4M5 4h12l-2.5 4L17 12H5"/>`,
  bell:`<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>`,
  list:`<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="2.4"/>`,
  bold:`<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" stroke-width="2.4"/>`,
  ital:`<path d="M10 5h8M6 19h8M14 5l-4 14"/>`,
  under:`<path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14"/>`,
  alignl:`<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>`,
  alignc:`<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>`,
  alignr:`<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>`,
  sizeup:`<path d="M4 18l4.5-12L13 18M5.7 14h5.6M18 6v6M15 9h6"/>`,
  sizedown:`<path d="M4 18l4.5-12L13 18M5.7 14h5.6M15 9h6"/>`,
  refresh:`<path d="M19.5 12A7.5 7.5 0 1 1 17.3 6.7"/><path d="M19.5 4.5v4h-4"/>`,
  file:`<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>`,
  qr:`<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h3v3M20 14v1.5M17 20h3M14 18.5V20"/>`,
  hand:`<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4a1.5 1.5 0 0 1 3 0v6M14 10V5.5a1.5 1.5 0 0 1 3 0V12M17 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L4.3 14a1.6 1.6 0 0 1 2.6-1.8L8 13.5"/>`,
  install:`<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M12 7.5v7M9 11.5l3 3 3-3M10 18h4"/>`,
  dice:`<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01" stroke-width="2.8"/>`,
  coin:`<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5" stroke-dasharray="2 2"/>`,
  vol:`<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>`,
  search:`<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>`,
  spin:`<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v4.5h-4.5"/>`,
  palette:`<path d="M12 3a9 9 0 0 0 0 18c1.5 0 2.1-1.1 1.5-2.2-.6-1.1.2-2.3 1.4-2.3H17a4 4 0 0 0 4-4C21 7 17 3 12 3z"/><circle cx="7.5" cy="11.5" r="1.3"/><circle cx="9.5" cy="7.3" r="1.3"/><circle cx="14.5" cy="7.3" r="1.3"/>`,
};
function svgFor(name){
  if (I[name]) return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name]}</svg>`;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${U[name] || ''}</svg>`;
}
function svg(name, cls){
  const t = document.createElement('template'); t.innerHTML = svgFor(name);
  const s = t.content.firstChild; if (cls) s.setAttribute('class', cls); return s;
}
const LOGO = `<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect class="f-butter" x="4" y="7" width="40" height="29" rx="7"/><path d="M12 22.5l5 5 9.5-11" stroke-width="3.4"/><path d="M31 24h7M31 18h4"/><path d="M15 41h18"/><rect class="f-pink" x="27" y="38.5" width="12" height="5" rx="2.5" transform="rotate(-12 33 41)"/></svg>`;

/* work symbols: large drawings, 120 grid */
const WSY = {
  silence:{t:'Silence', d:'Work on your own without talking', c:'var(--pink)',
    g:`<path class="f-card" d="M20 34a14 14 0 0 1 14-14h52a14 14 0 0 1 14 14v28a14 14 0 0 1-14 14H54L34 94V76a14 14 0 0 1-14-14z"/><path d="M42 44l36 22M78 44L42 66" stroke-width="8"/>`},
  whisper:{t:'Whisper', d:'Quiet voices only, so others can focus', c:'var(--butter)',
    g:`<path class="f-card" d="M22 40a12 12 0 0 1 12-12h36a12 12 0 0 1 12 12v18a12 12 0 0 1-12 12H50L36 84V70h-2a12 12 0 0 1-12-12z"/><circle class="f-ink" cx="40" cy="49" r="4" stroke="none"/><circle class="f-ink" cx="52" cy="49" r="4" stroke="none"/><circle class="f-ink" cx="64" cy="49" r="4" stroke="none"/><path d="M92 38c4 4 4 18 0 22M100 32c7 7 7 27 0 34" stroke-width="5"/>`},
  partner:{t:'Ask a partner', d:'Talk quietly with the person next to you', c:'var(--aqua)',
    g:`<circle class="f-card" cx="34" cy="58" r="13"/><path class="f-card" d="M12 100c2-16 12-24 22-24s20 8 22 24z"/><circle class="f-card" cx="86" cy="58" r="13"/><path class="f-card" d="M64 100c2-16 12-24 22-24s20 8 22 24z"/><path class="f-butter" d="M44 18h32a8 8 0 0 1 8 8v8a8 8 0 0 1-8 8H66l-6 8-6-8H44a8 8 0 0 1-8-8v-8a8 8 0 0 1 8-8z"/><path d="M50 30h20" stroke-width="5"/>`},
  group:{t:'Group work', d:'Share ideas and work together as a team', c:'var(--mint)',
    g:`<circle class="f-card" cx="60" cy="30" r="12"/><path class="f-card" d="M40 66c2-14 10-21 20-21s18 7 20 21z"/><circle class="f-card" cx="24" cy="62" r="11"/><path class="f-card" d="M5 98c2-13 9-19 19-19s17 6 19 19z"/><circle class="f-card" cx="96" cy="62" r="11"/><path class="f-card" d="M77 98c2-13 9-19 19-19s17 6 19 19z"/><path class="f-lav" d="M44 82h32v16H44z"/>`},
};
function wsSvg(k){ return `<svg viewBox="0 0 120 120" fill="none" stroke="var(--on-pastel)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--on-pastel)" aria-hidden="true">${WSY[k].g}</svg>`; }

/* poll faces */
const FACES = [
  {c:'var(--mint)', m:'M15 29c4 5 14 5 18 0'},
  {c:'var(--aqua)', m:'M16 30c3 2.5 13 2.5 16 0'},
  {c:'var(--butter)', m:'M16 31h16'},
  {c:'var(--pink)', m:'M16 33c3-3.5 13-3.5 16 0'},
];
function faceSvg(i){ const f = FACES[i % 4]; return `<svg viewBox="0 0 48 48" fill="none" stroke="var(--on-pastel)" stroke-width="3" stroke-linecap="round" aria-hidden="true"><circle cx="24" cy="24" r="20" style="fill:${f.c}"/><circle cx="17.5" cy="20" r="2.2" fill="var(--on-pastel)" stroke="none"/><circle cx="30.5" cy="20" r="2.2" fill="var(--on-pastel)" stroke="none"/><path d="${f.m}"/></svg>`; }

/* stickers, 100 grid */
const STK = {
  star:`<path class="f-butter" d="M50 8l12.4 26.6 29 3.4-21.4 19.9 5.7 28.7L50 72.3 24.3 86.6 30 57.9 8.6 38l29-3.4z"/><path d="M38 52c3 3 9 3 12 0M42 44v1M58 44v1" stroke-width="4"/>`,
  heart:`<path class="f-pink" d="M50 88S10 64 10 36a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 28-40 52-40 52z"/><path d="M26 34c0-5 4-9 9-9" stroke="#fff" stroke-width="5" opacity=".8"/>`,
  thumb:`<path class="f-lav" d="M12 46h16v42H12z"/><path class="f-aqua" d="M28 48l14-30c3-6 13-5 13 4v16h22c6 0 10 5 9 11l-6 28c-1 5-5 9-10 9H28z"/>`,
  trophy:`<path class="f-butter" d="M30 12h40v26a20 20 0 0 1-40 0z"/><path d="M30 20H16v6a14 14 0 0 0 14 14M70 20h14v6a14 14 0 0 1-14 14"/><path class="f-butter" d="M44 58h12v14H44z"/><path class="f-peach" d="M30 72h40v14H30z"/><path d="M50 22l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" stroke-width="3"/>`,
  smile:`<circle class="f-butter" cx="50" cy="50" r="40"/><path d="M33 58c8 11 26 11 34 0" stroke-width="6"/><circle class="f-ink" cx="36" cy="40" r="5" stroke="none"/><circle class="f-ink" cx="64" cy="40" r="5" stroke="none"/><circle class="f-pink" cx="26" cy="56" r="5" stroke="none" opacity=".7"/><circle class="f-pink" cx="74" cy="56" r="5" stroke="none" opacity=".7"/>`,
  check:`<circle class="f-mint" cx="50" cy="50" r="40"/><path d="M30 51l13 13 28-30" stroke-width="9"/>`,
  bulb:`<path class="f-butter" d="M50 10a28 28 0 0 0-16 51c3 2 5 6 5 10v3h22v-3c0-4 2-8 5-10a28 28 0 0 0-16-51z"/><path d="M40 82h20M43 90h14M50 74V56l-6-6M50 56l6-6"/><path d="M14 28l-6-3M86 28l6-3M50 2v-2" stroke-width="4"/>`,
  rocket:`<path class="f-lav" d="M50 6c16 12 22 32 18 56H32C28 38 34 18 50 6z"/><circle class="f-aqua" cx="50" cy="34" r="8"/><path class="f-pink" d="M32 50L18 66v12l16-10M68 50l14 16v12L66 68"/><path class="f-peach" d="M40 66c0 12 4 22 10 28 6-6 10-16 10-28z"/>`,
  crown:`<path class="f-butter" d="M12 34l18 16 20-30 20 30 18-16-8 46H20z"/><circle class="f-pink" cx="50" cy="60" r="6"/><circle class="f-aqua" cx="30" cy="64" r="4"/><circle class="f-mint" cx="70" cy="64" r="4"/>`,
  rainbow:`<path d="M10 76a40 40 0 0 1 80 0" stroke="var(--pink)" stroke-width="10"/><path d="M20 76a30 30 0 0 1 60 0" stroke="var(--butter)" stroke-width="10"/><path d="M30 76a20 20 0 0 1 40 0" stroke="var(--mint)" stroke-width="10"/><path d="M40 76a10 10 0 0 1 20 0" stroke="var(--aqua)" stroke-width="10"/><path class="f-card" d="M4 80a10 10 0 0 1 18-6 8 8 0 0 1 12 6 6 6 0 0 1-6 8H10a6 6 0 0 1-6-8zM66 80a10 10 0 0 1 18-6 8 8 0 0 1 12 6 6 6 0 0 1-6 8H72a6 6 0 0 1-6-8z" stroke-width="3"/>`,
  apple:`<path class="f-pink" d="M50 30c-10-8-34-6-34 22 0 20 14 38 26 38 4 0 6-2 8-2s4 2 8 2c12 0 26-18 26-38 0-28-24-30-34-22z"/><path d="M50 30c0-8 2-14 6-18"/><path class="f-mint" d="M56 22c4-8 14-10 20-8-2 8-12 12-20 8z"/>`,
  wow:`<path class="f-pink" d="M50 4l8 16 17-8-3 18 18 2-12 14 12 14-18 3 3 18-17-8-8 17-8-17-17 8 3-18-18-3 12-14L6 32l18-2-3-18 17 8z"/><text x="50" y="58" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="21" fill="var(--on-pastel)" stroke="none" textLength="50" lengthAdjust="spacingAndGlyphs">WOW!</text>`,
  great:`<path class="f-lav" d="M4 34h10v32H4l6-16zM96 34H86v32h10l-6-16z"/><rect class="f-butter" x="12" y="28" width="76" height="44" rx="8"/><text x="50" y="47" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="15" fill="var(--on-pastel)" stroke="none">GREAT</text><text x="50" y="63" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="15" fill="var(--on-pastel)" stroke="none">JOB!</text>`,
  hundred:`<circle class="f-card" cx="50" cy="50" r="42"/><text x="50" y="62" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="34" fill="var(--stop)" stroke="none">100</text><path d="M24 70h52M28 77h44" stroke="var(--stop)" stroke-width="4"/>`,
};
/* ---------- word stickers: praise, keep trying, something to fix, Arabic (all drawn here, 100 grid) ---------- */
const sTx = (t, x, y, fs, o = {}) => {
  const ar = /[؀-ۿ]/.test(t), est = [...t].length * fs * (ar ? .5 : .7);
  const fit = !ar && o.max && est > o.max ? ` textLength="${o.max}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="${ar ? 'Tajawal' : 'Fredoka'}, sans-serif" font-weight="${o.w || 700}" font-size="${fs}" fill="${o.fill || 'var(--on-pastel)'}" stroke="none"${fit}>${t}</text>`;
};
const sStar = (cx, cy, R, r, n) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n - Math.PI / 2, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * q).toFixed(1) + ' ' + (cy + Math.sin(a) * q).toFixed(1); } return d + 'Z'; };
const sScallop = (cx, cy, r, n) => { const pt = i => { const a = i / n * Math.PI * 2 - Math.PI / 2; return [(cx + Math.cos(a) * r).toFixed(1), (cy + Math.sin(a) * r).toFixed(1)]; }; const rb = (r * Math.sin(Math.PI / n) * 1.1).toFixed(1); let d = 'M' + pt(0).join(' '); for (let i = 1; i <= n; i++) d += `A${rb} ${rb} 0 0 1 ${pt(i).join(' ')}`; return d + 'Z'; };
const sArc = (cx, cy, r, a0, a1) => { // clockwise arc with an arrow head at the end (angles in degrees, 0 = right)
  const P = a => [cx + Math.cos(a * Math.PI / 180) * r, cy + Math.sin(a * Math.PI / 180) * r], [x0, y0] = P(a0), [x1, y1] = P(a1);
  const t = (a1 + 90) * Math.PI / 180, nx = Math.cos(a1 * Math.PI / 180), ny = Math.sin(a1 * Math.PI / 180), tx = Math.cos(t), ty = Math.sin(t), f = v => v.toFixed(1);
  return `<path d="M${f(x0)} ${f(y0)}A${r} ${r} 0 ${(a1 - a0 + 360) % 360 > 180 ? 1 : 0} 1 ${f(x1)} ${f(y1)}" stroke-width="6"/><path class="f-ink" d="M${f(x1 + tx * 9)} ${f(y1 + ty * 9)}L${f(x1 + nx * 8 - tx * 3)} ${f(y1 + ny * 8 - ty * 3)}L${f(x1 - nx * 8 - tx * 3)} ${f(y1 - ny * 8 - ty * 3)}Z" stroke-width="3"/>`;
};
const sMark = (d, col, w = 12) => `<path d="${d}" stroke-width="${w + 9}"/><path d="${d}" stroke="${col}" stroke-width="${w}"/>`;
const sRosette = (fill, inner = 'f-card') => `<path class="f-pink" d="M36 58L26 94l11-7 9 9 5-34z"/><path class="f-aqua" d="M64 58l10 36-11-7-9 9-5-34z"/><path class="${fill}" d="${sScallop(50, 42, 33, 14)}"/><circle class="${inner}" cx="50" cy="42" r="24" stroke-width="3.5"/>`;
const sBanner = fill => `<path class="f-aqua" d="M20 42H4l8 14-8 14h18zM80 42h16l-8 14 8 14H78z"/><path class="${fill}" d="M14 28q36-8 72 0v46q-36-8-72 0z"/>`;
const sArrows = fill => `<circle class="${fill}" cx="50" cy="50" r="44"/><g stroke-width="6">${sArc(50, 50, 33, 150, 285)}${sArc(50, 50, 33, 330, 105)}</g>`;
const sLabel = (fill, y = 72, hh = 24) => `<rect class="${fill}" x="6" y="${y}" width="88" height="${hh}" rx="${hh / 2}" stroke-width="4.5"/>`;
Object.assign(STK, {
  /* praise */
  welldone: `${sBanner('f-mint')}<path class="f-butter" d="${sStar(50, 15, 12, 5.5, 5)}" stroke-width="3.5"/>${sTx('WELL', 50, 46, 15, { max: 62 })}${sTx('DONE!', 50, 63, 15, { max: 62 })}`,
  super: `<path class="f-aqua" d="M14 18h72a8 8 0 0 1 8 8v38a8 8 0 0 1-8 8H46L28 90V72H14a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z"/><path class="f-butter" d="M90 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" stroke-width="3"/>${sTx('SUPER!', 50, 54, 21, { max: 76 })}`,
  amazing: `<path class="f-lav" d="${sStar(50, 46, 46, 21, 5)}"/><rect class="f-card" x="5" y="54" width="90" height="22" rx="5" stroke-width="4.5"/>${sTx('AMAZING!', 50, 70, 14, { max: 80 })}`,
  youdidit: `<circle class="f-mint" cx="50" cy="52" r="36"/><g stroke-width="3"><rect class="f-pink" x="6" y="8" width="9" height="9" rx="2" transform="rotate(20 10 12)"/><circle class="f-butter" cx="88" cy="14" r="5"/><path class="f-aqua" d="M84 86l9 3-6 7z"/><circle class="f-pink" cx="9" cy="86" r="4"/><path d="M76 4q4 4 8 0" stroke="var(--peach)" stroke-width="4"/></g>${sTx('YOU', 50, 48, 16, { max: 52 })}${sTx('DID IT!', 50, 66, 15, { max: 58 })}`,
  excellent: `<path class="f-aqua" d="M26 2h14l12 30H38z"/><path class="f-pink" d="M74 2H60L48 32h14z"/><circle class="f-butter" cx="50" cy="48" r="23"/><path class="f-peach" d="${sStar(50, 48, 13, 6, 5)}" stroke-width="3"/>${sLabel('f-card', 74, 22)}${sTx('EXCELLENT', 50, 90, 13, { max: 80 })}`,
  nicework: `<path class="f-card" d="M24 6h38l14 14v54H24z"/><path d="M62 6v14h14" stroke-width="4"/>${sMark('M34 40l10 10 22-22', 'var(--go)', 8)}${sLabel('f-butter', 66, 26)}${sTx('NICE WORK', 50, 85, 14, { max: 82 })}`,
  brilliant: `<path class="f-aqua" d="M28 10h44l18 20-40 42-40-42z"/><path d="M10 30h80M28 10l10 20 12 42 12-42 10-20M38 30l12-20 12 20" stroke-width="3.5"/>${sLabel('f-pink', 70, 24)}${sTx('BRILLIANT!', 50, 88, 13, { max: 80 })}`,
  proud: `<path class="f-pink" d="M50 92S6 66 6 36a22 22 0 0 1 44-7 22 22 0 0 1 44 7c0 30-44 56-44 56z"/>${sTx('PROUD', 50, 48, 15, { max: 56 })}${sTx('OF YOU', 50, 64, 13, { max: 52 })}`,
  starstudent: `<path class="f-butter" d="${sStar(50, 40, 38, 24, 6)}"/><circle class="f-card" cx="50" cy="40" r="15" stroke-width="3.5"/>${sTx('STAR', 50, 44, 10, { max: 24 })}${sLabel('f-lav', 68, 24)}${sTx('STUDENT', 50, 86, 15, { max: 76 })}`,
  greatidea: `<g stroke-width="4"><path d="M16 18l8 6M84 18l-8 6M50 2v6M10 44h8M82 44h8"/></g><path class="f-butter" d="M50 12a22 22 0 0 0-13 40c3 2 4 5 4 8v4h18v-4c0-3 1-6 4-8a22 22 0 0 0-13-40z"/><path d="M50 56V44l-5-5M50 44l5-5" stroke-width="3.5"/>${sLabel('f-mint', 70, 24)}${sTx('GREAT IDEA!', 50, 88, 12, { max: 80 })}`,
  teamwork: `<path class="f-mint" d="M18 30H40a10 10 0 1 1 18 0H80V50a10 10 0 1 1 0 18V92H18z"/>${sTx('TEAM', 49, 59, 15, { max: 54 })}${sTx('WORK', 49, 78, 15, { max: 54 })}`,
  /* keep trying */
  goodtry: `${sRosette('f-butter')}${sTx('GOOD', 50, 40, 13, { max: 40 })}${sTx('TRY!', 50, 55, 14, { max: 40 })}`,
  goodeffort: `<path class="f-peach" d="M50 4l40 23v46L50 96 10 73V27z"/><path d="M50 14l31 18v36L50 86 19 68V32z" stroke="#fff" stroke-width="3" opacity=".8"/>${sTx('GOOD', 50, 47, 16, { max: 56 })}${sTx('EFFORT', 50, 65, 14, { max: 58 })}`,
  keepgoing: `<path class="f-peach" d="M44 64h12v32H44z"/><path class="f-butter" d="M6 14h62l26 26-26 26H6z"/>${sTx('KEEP', 39, 36, 15, { max: 56 })}${sTx('GOING!', 39, 55, 14, { max: 58 })}`,
  almost: `<path class="f-mint" d="M2 96C14 70 34 54 58 48c16-4 30 6 40 48z"/><path d="M70 48V14"/><path class="f-pink" d="M70 14h24l-7 8 7 8H70z" stroke-width="4"/><path d="M14 88q18-18 38-30" stroke-width="4" stroke-dasharray="1 9"/>${sTx('ALMOST', 34, 22, 14, { max: 60 })}${sTx('THERE!', 34, 38, 14, { max: 60 })}`,
  /* something to fix */
  cross: sMark('M26 26l48 48M74 26L26 74', 'var(--stop)', 13),
  oops: `<circle class="f-peach" cx="48" cy="38" r="30"/><circle class="f-ink" cx="38" cy="34" r="4.5" stroke="none"/><circle class="f-ink" cx="58" cy="34" r="4.5" stroke="none"/><circle cx="48" cy="50" r="5.5" stroke-width="4"/><path class="f-aqua" d="M82 10c5 7 8 11 8 15a8 8 0 0 1-16 0c0-4 3-8 8-15z" stroke-width="3.5"/>${sLabel('f-butter', 72, 24)}${sTx('OOPS!', 50, 90, 17, { max: 70 })}`,
  tryagain: `${sArrows('f-aqua')}${sTx('TRY', 50, 48, 14, { max: 40 })}${sTx('AGAIN', 50, 63, 13, { max: 42 })}`,
  checkagain: `${sMark('M64 64l24 24', 'var(--peach)', 9)}<circle class="f-card" cx="42" cy="42" r="34"/><circle cx="42" cy="42" r="27" stroke="var(--aqua)" stroke-width="4"/>${sTx('CHECK', 42, 41, 12, { max: 44 })}${sTx('AGAIN', 42, 56, 12, { max: 44 })}`,
  notquite: `<path class="f-butter" d="M50 4l42 72H8z"/><path d="M50 26v24" stroke-width="8"/><circle class="f-ink" cx="50" cy="62" r="5" stroke="none"/>${sLabel('f-peach', 72, 24)}${sTx('NOT QUITE', 50, 89, 13, { max: 74 })}`,
  thinkagain: `<circle class="f-lav" cx="20" cy="84" r="6" stroke-width="4"/><circle class="f-lav" cx="9" cy="95" r="3.5" stroke-width="3"/><path class="f-lav" d="M24 70a15 15 0 0 1 0-30 20 20 0 0 1 36-12 17 17 0 0 1 24 14 13 13 0 0 1-4 28z"/>${sTx('THINK', 53, 51, 14, { max: 52 })}${sTx('AGAIN', 53, 65, 13, { max: 50 })}`,
  spelling: `<rect class="f-butter" x="6" y="10" width="26" height="26" rx="5" stroke-width="4"/><rect class="f-pink" x="37" y="10" width="26" height="26" rx="5" stroke-width="4"/><rect class="f-aqua" x="68" y="10" width="26" height="26" rx="5" stroke-width="4"/>${sTx('A', 19, 31, 19)}${sTx('B', 50, 31, 19)}${sTx('C', 81, 31, 19)}<rect class="f-card" x="4" y="46" width="92" height="30" rx="8" stroke-width="4.5"/>${sTx('SPELLING?', 50, 67, 15, { max: 82 })}<path d="M12 86q5-6 10 0t10 0 10 0 10 0 10 0 10 0 10 0 10 0" stroke="var(--stop)" stroke-width="4"/>`,
  capital: `<rect class="f-lav" x="10" y="4" width="80" height="92" rx="14"/>${sTx('A', 42, 50, 46)}<path d="M72 46V22M64 30l8-8 8 8" stroke-width="5"/>${sTx('CAPITAL', 50, 70, 13, { max: 70 })}${sTx('LETTER', 50, 86, 13, { max: 70 })}`,
  fullstop: `<rect class="f-butter" x="8" y="6" width="84" height="88" rx="14"/>${sTx('FULL', 50, 34, 19, { max: 70 })}${sTx('STOP', 50, 55, 19, { max: 70 })}<circle class="f-ink" cx="50" cy="74" r="7" stroke="none"/><circle cx="50" cy="74" r="14" stroke="var(--stop)" stroke-width="4"/>`,
  readagain: `${sTx('READ AGAIN', 50, 22, 15, { max: 88 })}<path class="f-aqua" d="M4 40v52c16-6 32-6 46 2 14-8 30-8 46-2V40"/><path class="f-card" d="M50 40C38 30 22 30 8 36v50c14-6 30-6 42 2zM50 40c12-10 28-10 42-4v50c-14-6-30-6-42 2z"/><path d="M50 40v48" stroke-width="3.5"/><path d="M16 50c9-3 18-3 26 1M16 62c9-3 18-3 26 1M58 51c8-4 17-4 26-1M58 63c8-4 17-4 26-1" stroke="var(--aqua)" stroke-width="3"/><path class="f-pink" d="M64 34v16l5-5 5 5V32" stroke-width="3"/>`,
  neat: `<rect class="f-card" x="8" y="26" width="84" height="68" rx="8"/><path d="M18 60h64M18 78h64" stroke="var(--aqua)" stroke-width="2.5"/><path class="f-butter" d="M22 8h52v16H22z" stroke-width="4"/><path class="f-pink" d="M74 8h12a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H74z" stroke-width="4"/><path class="f-peach" d="M22 8L8 16l14 8z" stroke-width="4"/>${sTx('WRITE', 50, 55, 15, { max: 70 })}${sTx('NEATLY', 50, 74, 15, { max: 70 })}`,
  fixit: `<g transform="rotate(-12 50 38)"><path class="f-pink" d="M16 22h42v30H16z"/><path class="f-card" d="M58 22h26v30H58z"/></g><g class="f-ink" stroke="none"><circle cx="30" cy="66" r="2.5"/><circle cx="42" cy="70" r="2"/><circle cx="56" cy="67" r="2.5"/><circle cx="68" cy="71" r="2"/></g>${sLabel('f-butter', 74, 22)}${sTx('FIX IT', 50, 91, 16, { max: 70 })}`,
  /* Arabic */
  ar_ahsant: `<path class="f-butter" d="${sStar(50, 38, 37, 17, 5)}"/><circle class="f-card" cx="50" cy="40" r="6" stroke-width="3"/>${sLabel('f-pink', 68, 28)}${sTx('أحسنت', 50, 89, 19)}`,
  ar_mumtaz: `${sRosette('f-mint')}${sTx('ممتاز', 50, 49, 15)}`,
  ar_raee: `<path class="f-pink" d="M50 92S6 66 6 36a22 22 0 0 1 44-7 22 22 0 0 1 44 7c0 30-44 56-44 56z"/>${sTx('رائع', 50, 58, 24)}`,
  ar_amal: `${sBanner('f-lav')}<path class="f-butter" d="${sStar(50, 15, 12, 5.5, 5)}" stroke-width="3.5"/>${sTx('عمل رائع', 50, 60, 15)}`,
  ar_muhawala: `<circle class="f-aqua" cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="36" stroke="#fff" stroke-width="3" stroke-dasharray="2 7" opacity=".9"/>${sTx('محاولة', 50, 48, 17)}${sTx('جيدة', 50, 70, 19)}`,
  ar_qarib: `<circle class="f-card" cx="50" cy="40" r="35"/><circle class="f-pink" cx="50" cy="40" r="25" stroke-width="3.5"/><circle class="f-card" cx="50" cy="40" r="15" stroke-width="3.5"/><circle class="f-pink" cx="50" cy="40" r="6" stroke-width="3"/><path d="M58 32L84 8" stroke-width="4"/><path class="f-butter" d="M84 8l2-8 6 6zM84 8l8-2-6 6z" stroke-width="3"/>${sLabel('f-butter', 72, 24)}${sTx('قريب جداً', 50, 90, 15)}`,
  ar_khata: `<g transform="rotate(-25 50 36)"><rect class="f-peach" x="10" y="24" width="80" height="26" rx="13"/><rect class="f-card" x="38" y="27" width="24" height="20" rx="3" stroke-width="3"/><g class="f-ink" stroke="none"><circle cx="20" cy="33" r="1.8"/><circle cx="26" cy="41" r="1.8"/><circle cx="76" cy="33" r="1.8"/><circle cx="82" cy="41" r="1.8"/></g></g>${sLabel('f-card', 72, 24)}${sTx('خطأ بسيط', 50, 90, 16)}`,
  ar_hawil: `${sArrows('f-mint')}${sTx('حاول', 50, 48, 15)}${sTx('مرة أخرى', 50, 65, 11.5)}`,
});
const STK_GROUPS = [
  ['Praise', ['welldone', 'super', 'great', 'amazing', 'excellent', 'youdidit', 'nicework', 'brilliant', 'proud', 'starstudent', 'greatidea', 'teamwork', 'wow', 'hundred']],
  ['Keep trying', ['goodtry', 'goodeffort', 'keepgoing', 'almost']],
  ['Something to fix', ['cross', 'oops', 'tryagain', 'checkagain', 'notquite', 'thinkagain', 'spelling', 'capital', 'fullstop', 'readagain', 'neat', 'fixit']],
  ['Pictures', ['star', 'heart', 'thumb', 'trophy', 'smile', 'check', 'bulb', 'rocket', 'crown', 'rainbow', 'apple']],
];
const STK_NAME = { star: 'Star', heart: 'Heart', thumb: 'Thumbs up', trophy: 'Trophy', smile: 'Smiley', check: 'Tick', bulb: 'Light bulb', rocket: 'Rocket', crown: 'Crown', rainbow: 'Rainbow', apple: 'Apple',
  wow: 'Wow!', great: 'Great job!', hundred: '100', welldone: 'Well done!', super: 'Super!', amazing: 'Amazing!', youdidit: 'You did it!', excellent: 'Excellent', nicework: 'Nice work', brilliant: 'Brilliant!',
  proud: 'Proud of you', starstudent: 'Star student', greatidea: 'Great idea!', teamwork: 'Teamwork', goodtry: 'Good try!', goodeffort: 'Good effort', keepgoing: 'Keep going!', almost: 'Almost there!',
  cross: 'Wrong (red cross)', oops: 'Oops!', tryagain: 'Try again', checkagain: 'Check again', notquite: 'Not quite', thinkagain: 'Think again', spelling: 'Check your spelling', capital: 'Capital letter',
  fullstop: 'Full stop', readagain: 'Read again', neat: 'Write neatly', fixit: 'Fix it', ar_ahsant: 'أحسنت', ar_mumtaz: 'ممتاز', ar_raee: 'رائع', ar_amal: 'عمل رائع', ar_muhawala: 'محاولة جيدة',
  ar_qarib: 'قريب جداً', ar_khata: 'خطأ بسيط', ar_hawil: 'حاول مرة أخرى' };
const STK_WORDY = new Set(STK_GROUPS.slice(0, 3).flatMap(g => g[1]));
function stkSvg(k){ return `<svg viewBox="0 0 100 100" fill="none" stroke="var(--on-pastel)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--on-pastel)" aria-hidden="true">${STK[k] || STK.star}</svg>`; }

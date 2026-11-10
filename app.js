"use strict";
const fallback=[];
const state={programs:[],group:"전체",query:""};
const programImages = Object.freeze({
  "photo-schedule": "photo-schedule-approved.webp",
  "aac-toolbox": "aac-toolbox-approved.webp",
  listening: "listening-approved.webp",
  reading: "reading.webp",
  articulation: "articulation.webp",
  writing: "writing.webp",
  dyslexia: "dyslexia.webp",
  "hangul-dyslexia": "hangul-dyslexia.webp",
  pragmatics: "pragmatics.webp",
  aac: "aac.webp",
  curriculum: "curriculum.webp",
  "worksheet-maker": "worksheet-maker.webp"
});
const icons={
 listening:`<path d="M47 69V52a37 37 0 0 1 74 0v17" fill="none" stroke="#599880" stroke-width="8" stroke-linecap="round"/><rect x="36" y="56" width="22" height="37" rx="10" fill="#DFF0E9" stroke="#599880" stroke-width="3"/><rect x="110" y="56" width="22" height="37" rx="10" fill="#DFF0E9" stroke="#599880" stroke-width="3"/><path d="M67 65v15m12-26v38m12-30v23m12-15v6" stroke="#599880" stroke-width="5" stroke-linecap="round"/><circle cx="131" cy="25" r="13" fill="#FFF0C9"/><path d="m125 25 4 4 8-9" fill="none" stroke="#A78238" stroke-width="3" stroke-linecap="round"/></svg>`.replace("</svg>",""),
  book:`<rect x="38" y="30" width="47" height="67" rx="6" fill="#FFFFFF" stroke="#3C79A8" stroke-width="3"/><path d="M85 40C97 34 111 34 126 40V100C111 95 99 95 85 101Z" fill="#C9E6F7" stroke="#3C79A8" stroke-width="3"/><path d="M85 40C72 34 58 34 44 40V101C58 95 72 95 85 101Z" fill="#FFFFFF" stroke="#3C79A8" stroke-width="3"/><path d="M54 52H74M54 65H74M97 52H115M97 65H115" stroke="#80B2D0" stroke-width="3" stroke-linecap="round"/><circle cx="129" cy="27" r="13" fill="#FEDC9F"/><path d="M124 27h10m-5-5v10" stroke="#CB8935" stroke-width="2" stroke-linecap="round"/>`,
  speech:`<circle cx="73" cy="47" r="26" fill="#FFDEBA"/><path d="M52 48C39 10 91 7 99 38L97 45C85 41 75 33 68 28C64 37 59 43 52 48Z" fill="#3E6987"/><circle cx="65" cy="50" r="2.7" fill="#315773"/><circle cx="82" cy="50" r="2.7" fill="#315773"/><path d="M66 61Q73 67 81 61" stroke="#315773" stroke-width="2.6" stroke-linecap="round"/><path d="M49 90Q74 68 99 90V107H49Z" fill="#9AC4E0" stroke="#3C79A8" stroke-width="2"/><path d="M109 15h22q9 0 9 9v12q0 9-9 9h-4l-10 8v-8h-8q-8 0-8-9V24q0-9 8-9Z" fill="#fff" stroke="#568EB6" stroke-width="2"/><circle cx="114" cy="30" r="2.5" fill="#568EB6"/><circle cx="122" cy="30" r="2.5" fill="#568EB6"/><circle cx="130" cy="30" r="2.5" fill="#568EB6"/>`,
  library:`<rect x="44" y="23" width="90" height="84" rx="9" fill="#FFFFFF" stroke="#6376AB" stroke-width="3"/><path d="M60 42h58m-58 13h58m-58 13h32" stroke="#B7BFDE" stroke-width="6" stroke-linecap="round"/><rect x="25" y="34" width="20" height="73" rx="5" fill="#AFB6E7" stroke="#6376AB" stroke-width="3"/><path d="M35 43v54" stroke="#fff" stroke-width="2"/><circle cx="120" cy="83" r="23" fill="#F4EEFF" stroke="#6376AB" stroke-width="3"/><path d="M112 84l6 6 12-14" stroke="#6376AB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
  letters:`<rect x="34" y="24" width="101" height="80" rx="11" fill="#fff" stroke="#579D8B" stroke-width="3"/><text x="49" y="79" fill="#459782" font-size="44" font-family="Arial,sans-serif" font-weight="700">Aa</text><circle cx="135" cy="28" r="15" fill="#D6F4E7"/><path d="m127 28 5 5 10-11" stroke="#459782" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
  pencil:`<rect x="40" y="28" width="89" height="77" rx="7" fill="#fff" stroke="#B38B4D" stroke-width="3"/><path d="M53 48h36M53 62h51M53 76h30" stroke="#E0C695" stroke-width="5" stroke-linecap="round"/><path d="m106 37 12-12 22 22-12 12-30 9Z" fill="#FFD38D" stroke="#AD8849" stroke-width="3"/><path d="m97 69 8-24 16 15Z" fill="#FFECC5" stroke="#AD8849" stroke-width="2"/>`,
  people:`<circle cx="59" cy="42" r="18" fill="#FFDCBC" stroke="#AD6880" stroke-width="2"/><circle cx="108" cy="42" r="18" fill="#FFE2C5" stroke="#AD6880" stroke-width="2"/><path d="M34 104Q34 70 59 70Q84 70 84 104M83 104Q83 70 108 70Q133 70 133 104" fill="#FFE5EA" stroke="#AD6880" stroke-width="3"/><path d="M41 43Q38 14 59 19Q75 18 77 42M89 40Q95 16 109 18Q124 19 127 40" stroke="#6F557A" stroke-width="9" stroke-linecap="round"/><path d="M70 52h11" stroke="#AD6880" stroke-width="2.5"/>`,
  calendar:`<rect x="34" y="30" width="100" height="78" rx="12" fill="#fff" stroke="#C99A1E" stroke-width="3"/><rect x="34" y="30" width="100" height="24" rx="12" fill="#FFD95C" stroke="#C99A1E" stroke-width="3"/><path d="M55 22v16M113 22v16" stroke="#C99A1E" stroke-width="5" stroke-linecap="round"/><rect x="47" y="64" width="22" height="18" rx="4" fill="#FFF0B8"/><rect x="73" y="64" width="22" height="18" rx="4" fill="#DDF3E8"/><rect x="99" y="64" width="22" height="18" rx="4" fill="#FFF0B8"/><rect x="47" y="86" width="22" height="14" rx="4" fill="#FFF0B8"/><path d="m77 71 5 5 9-10" fill="none" stroke="#3E9A73" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="131" cy="27" r="13" fill="#DDF3E8"/><path d="m125 27 4 4 8-9" fill="none" stroke="#3E9A73" stroke-width="3" stroke-linecap="round"/>`,
  cards:`<rect x="38" y="39" width="67" height="61" rx="9" fill="#fff" stroke="#4686A2" stroke-width="3"/><rect x="67" y="23" width="72" height="59" rx="9" fill="#B6E0ED" stroke="#4686A2" stroke-width="3"/><circle cx="102" cy="47" r="10" fill="#F8D3A6"/><path d="M83 70Q102 51 121 70" fill="#78AFC8"/><path d="M51 61h27M51 74h27" stroke="#9DCADB" stroke-width="4" stroke-linecap="round"/>`
};

const safeText=s=>String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=s=>{try{const u=new URL(s);return u.protocol==='https:'?u.href:'';}catch{return ''}};
function card(p){
 const pic=icons[p.icon]||icons.book;
 const illustration = programImages[p.id] ? `<img class="program-art-image" src="././${programImages[p.id]}?v=20261028-subject-art" alt="" loading="lazy" decoding="async" width="1100" height="500">` : `<svg viewBox="0 0 168 125" aria-hidden="true">${pic}</svg>`;
 const isExternal=p.mode==='existing-login'||p.mode==='reference'||p.mode==='direct-link';
 const internalTarget=p.mode==='internal'&&typeof p.url==='string'&&/^\.\/[\w\-\/]+(\.html)?$/.test(p.url)?p.url:'';
 const target=(p.id==='reading'?'./program.html?program=reading':'')||internalTarget||(isExternal?safeUrl(p.url):`./program.html?program=${encodeURIComponent(p.id)}`);
 const active=!!target;
 const label=p.mode==='reference'?'자료실 열기':'활동 시작하기';
 const badge=p.mode==='reference'?'공개 자료실':'';
 return `<article class="program-card"><div class="program-top ${safeText(p.color)}">${badge?`<span class="status">${badge}</span>`:""}${illustration}</div><div class="program-content"><h3>${safeText(p.name)}</h3><p class="program-subtitle">${safeText(p.subtitle||p.english)}</p><div class="card-footer">${active?`<a class="card-link" href="${safeText(target)}" >${label} <span aria-hidden="true">↗</span></a>`:'<span class="card-pending">주소 확인 후 연결됩니다</span>'}</div></div></article>`;
}
function render(){
 const groups=['전체',...new Set(state.programs.map(p=>p.group))];
 const tabs=document.getElementById('filters');
 tabs.innerHTML=groups.map(g=>`<button type="button" class="tab ${g===state.group?'active':''}" data-group="${safeText(g)}" aria-pressed="${g===state.group}">${safeText(g)}</button>`).join('');
 const filtered=state.programs.filter(p=>(state.group==='전체'||p.group===state.group)&&(`${p.name} ${p.subtitle||""} ${(p.aliases||[]).join(" ")} ${p.english} ${p.description} ${(p.features||[]).join(' ')}`.toLowerCase().includes(state.query.toLowerCase())));
 document.getElementById('cards').innerHTML=filtered.length?filtered.map(card).join(''):'<div class="no-result">일치하는 프로그램이 없습니다.</div>';
 document.getElementById('resultCount').textContent=`전체 ${state.programs.length}개 활동`;
 tabs.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{state.group=b.dataset.group;render()}));
}
document.getElementById('search').addEventListener('input',e=>{state.query=e.target.value.trim();render()});
(async()=>{try{const r=await fetch('./programs.json',{cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();if(!Array.isArray(data))throw Error();state.programs=data;}catch{document.getElementById('cards').textContent='프로그램 목록을 불러오지 못했습니다.';return;}render()})();


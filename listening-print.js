/* Build print sheets only after the existing teacher login has opened training. */
function listeningPrintNode(parent, tag, text, cls) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (cls) node.className = cls;
  parent.appendChild(node);
  return node;
}
function listeningPrintReady() {
  return !document.getElementById('trainingMain').hidden && typeof dataset === 'function';
}
function listeningPrintPage(root, subtitle) {
  const page = listeningPrintNode(root, 'section', undefined, 'listening-print-page');
  listeningPrintNode(page, 'p', '채움언어학습연구소', 'print-brand');
  listeningPrintNode(page, 'h1', '듣고 기억하기');
  listeningPrintNode(page, 'h2', subtitle);
  listeningPrintNode(page, 'p', '이름: '+(typeof currentListeningChild==='function'&&currentListeningChild()?.name||'____________________')+'    날짜: '+(typeof db!=='undefined'&&db.date||'____________________'), 'print-identity');
  return page;
}
function printListeningActivity() {
  if (!listeningPrintReady()) return;
  const root = document.getElementById('listeningPrintOutput');
  root.replaceChildren();
  const scope = document.getElementById('printScope').value;
  const groups=[];
  const modes=scope==='all'?['memory','story']:[mode];
  for(const printMode of modes){
    const levels=['all','mode'].includes(scope)?['1','2','3']:[level];
    for(const printLevel of levels){
      const items=scope==='current'?[cur()]:(printMode==='memory'
        ? M.map((a,k)=>({id:k,lv:a[0],body:a[1]}))
        : S.map((a,k)=>({id:k,lv:a[0],title:a[1],body:a[2],questions:a[3]}))).filter(a=>a.lv===printLevel);
      if(items.length)groups.push({mode:printMode,level:printLevel,items});
    }
  }
  const totalPages=groups.reduce((n,g)=>n+Math.ceil(g.items.length/(g.mode==='story'?1:3)),0);
  let pageNumber=0;
  const passage = document.getElementById('printPassage').checked;
  const answer = document.getElementById('printAnswers').checked;
  for(const {mode,level,items} of groups){
  const size = mode === 'story' ? 1 : 3;
  for (let start = 0; start < items.length; start += size) {
    const page = listeningPrintPage(root, (mode === 'story' ? '이야기 듣기' : '문장 기억') + ' · ' + level + '단계' + (answer ? ' · 정답 포함' : ''));
    if(mode==='memory')page.classList.add('memory-page');
    listeningPrintNode(page, 'p', mode === 'story' ? '이야기를 듣고 질문에 답해 보세요.' : '문장을 듣고 기억해서 그대로 말해 보세요.');
    for (const item of items.slice(start, start + size)) {
      const block = listeningPrintNode(page, 'div', undefined, 'print-item');
      listeningPrintNode(block, 'h3', mode === 'story' ? item.title : '문장 ' + (item.id + 1));
      if (passage) listeningPrintNode(block, 'p', item.body, 'print-passage');
      if (mode === 'story') item.questions.forEach((question, index) => {
        const row = listeningPrintNode(block, 'div', undefined, 'print-question');
        listeningPrintNode(row, 'p', (index + 1) + '. ' + question[0]);
        listeningPrintNode(row, 'p', answer ? '예시 정답: ' + question[1] : '답:', answer ? 'print-response answer-filled' : 'print-response');
      });
      else {
        if (answer && !passage) listeningPrintNode(block, 'p', '목표 문장: ' + item.body, 'print-passage');
        listeningPrintNode(block, 'p', '반응:  □ 독립 정반응   □ 단서 후   □ 오반응', 'print-checks');
        listeningPrintNode(block, 'p', '관찰:', 'print-response');
      }
    }
    listeningPrintFooter(page, (++pageNumber) + ' / ' + totalPages);
  }
  }
  showListeningPrintPreview();
}
function printListeningReport() {
  if (!listeningPrintReady()) return;
  saveReport();
  const root = document.getElementById('listeningPrintOutput');
  root.replaceChildren();
  const page = listeningPrintPage(root, '결과·상담 기록');
  page.classList.add('report-page');
  listeningPrintNode(page, 'div', report(), 'print-report');
  showListeningPrintPreview();
}
function clearListeningPrint() {
  document.body.classList.remove('listening-printing','listening-preview-open');
  document.getElementById('listeningPrintOutput').setAttribute('aria-hidden','true');
  if(listeningPrintPreviousFocus?.isConnected) listeningPrintPreviousFocus.focus();
  document.getElementById('listeningPrintOutput').replaceChildren();
}
// Keep the preview intact after print/cancel; some mobile print dialogs return early.
window.addEventListener('afterprint',()=>document.body.classList.remove('listening-printing'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('listening-preview-open'))clearListeningPrint();});
new MutationObserver(() => {
  if (document.getElementById('trainingMain').hidden) clearListeningPrint();
}).observe(document.getElementById('trainingMain'), {attributes: true, attributeFilter: ['hidden']});

let listeningPrintPreviousFocus=null;
function listeningPrintFooter(page, number){
 const footer=listeningPrintNode(page,'div',undefined,'print-page-number');
 const logo=listeningPrintNode(footer,'img');logo.src='./chaeum-official-logo.webp';logo.alt='채움언어학습연구소';
 listeningPrintNode(footer,'span','Page '+number);
}
function showListeningPrintPreview(){
 const root=document.getElementById('listeningPrintOutput');
 listeningPrintPreviousFocus=document.activeElement;
 root.setAttribute('aria-hidden','false');
 const toolbar=document.createElement('div');toolbar.className='print-toolbar';
 listeningPrintNode(toolbar,'p','인쇄 미리보기 · A4 세로');
 const print=listeningPrintNode(toolbar,'button','인쇄 / PDF 저장');print.type='button';print.className='primary';
 print.onclick=async()=>{print.disabled=true;try{if(document.fonts)await document.fonts.ready;await Promise.all(Array.from(root.querySelectorAll('img')).map(img=>img.decode?img.decode().catch(()=>{}):Promise.resolve()));if(listeningPrintReady()&&document.body.classList.contains('listening-preview-open'))window.print();}finally{print.disabled=false;}};
 const close=listeningPrintNode(toolbar,'button','닫기');close.type='button';close.onclick=clearListeningPrint;
 root.prepend(toolbar);document.body.classList.add('listening-preview-open');root.scrollTop=0;close.focus();
}
window.addEventListener('beforeprint',()=>{
 if(!listeningPrintReady()||document.body.classList.contains('listening-preview-open'))return;
 if(!document.getElementById('report').classList.contains('hide'))printListeningReport();else printListeningActivity();
});

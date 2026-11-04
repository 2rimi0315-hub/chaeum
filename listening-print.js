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
  const items = document.getElementById('printScope').value === 'level' ? dataset() : [cur()];
  const passage = document.getElementById('printPassage').checked;
  const answer = document.getElementById('printAnswers').checked;
  const size = mode === 'story' ? 1 : 4;
  for (let start = 0; start < items.length; start += size) {
    const page = listeningPrintPage(root, (mode === 'story' ? '이야기 듣기' : '문장 기억') + ' · ' + level + '단계' + (answer ? ' · 정답 포함' : ''));
    listeningPrintNode(page, 'p', mode === 'story' ? '이야기를 듣고 질문에 답해 보세요.' : '문장을 듣고 기억해서 그대로 말해 보세요.');
    for (const item of items.slice(start, start + size)) {
      const block = listeningPrintNode(page, 'div', undefined, 'print-item');
      listeningPrintNode(block, 'h3', mode === 'story' ? item.title : '문장 ' + (item.id + 1));
      if (passage) listeningPrintNode(block, 'p', item.body, 'print-passage');
      if (mode === 'story') item.questions.forEach((question, index) => {
        const row = listeningPrintNode(block, 'div', undefined, 'print-question');
        listeningPrintNode(row, 'p', (index + 1) + '. ' + question[0]);
        listeningPrintNode(row, 'p', answer ? '예시 정답: ' + question[1] : '답: __________________________________________________', 'print-response');
      });
      else {
        if (answer) listeningPrintNode(block, 'p', '목표 문장: ' + item.body);
        listeningPrintNode(block, 'p', '반응:  □ 독립 정반응   □ 단서 후   □ 오반응');
        listeningPrintNode(block, 'p', '관찰: __________________________________________________', 'print-response');
      }
    }
    listeningPrintNode(page, 'p', (Math.floor(start / size) + 1) + ' / ' + Math.ceil(items.length / size), 'print-page-number');
  }
  document.body.classList.add('listening-printing');
  window.print();
}
function printListeningReport() {
  if (!listeningPrintReady()) return;
  saveReport();
  const root = document.getElementById('listeningPrintOutput');
  root.replaceChildren();
  const page = listeningPrintPage(root, '결과·상담 기록');
  listeningPrintNode(page, 'div', report(), 'print-report');
  document.body.classList.add('listening-printing');
  window.print();
}
function clearListeningPrint() {
  document.body.classList.remove('listening-printing');
  document.getElementById('listeningPrintOutput').replaceChildren();
}
window.addEventListener('afterprint', clearListeningPrint);
new MutationObserver(() => {
  if (document.getElementById('trainingMain').hidden) clearListeningPrint();
}).observe(document.getElementById('trainingMain'), {attributes: true, attributeFilter: ['hidden']});

(()=>{'use strict';
const params=new URLSearchParams(location.search),id=params.get('program');
const modules=['articulation','pragmatics','aac','hangul-dyslexia','dyslexia','writing','curriculum','worksheet-maker','reading'];
if(!modules.includes(id)){document.getElementById('message').textContent='통합 홈에서 활동을 선택해 주세요.';return;}
const reading=id==='reading',target=new URL(reading?'https://radiant-nasturtium-f93c4a.netlify.app/':'https://stellar-sunburst-e87ec6.netlify.app/program.html');
if(!reading){target.searchParams.set('program',id);if(params.get('view')==='records')target.searchParams.set('view','records');const path=params.get('next');if(path)target.searchParams.set('next',path);target.searchParams.set('owner','checked');}
document.getElementById('continue').href=target.href;
let token='';try{token=localStorage.getItem('chaeum-owner-session-v1')||''}catch{}
if(!/^[a-f0-9]{64}$/.test(token)){location.replace(target.href);return;}
async function connect(){
 try{
  const r=await fetch('https://jqwnybitiotzuyawzhwk.supabase.co/functions/v1/listening-access',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({action:'admin-me'})});
  if(r.status===401){localStorage.removeItem('chaeum-owner-session-v1');location.replace(target.href);return;}
  const d=await r.json();if(!r.ok||d.role!=='admin')throw Error('관리자 로그인 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
  const endpoint=new URL(reading?'/.netlify/functions/api':'/.netlify/functions/hub',target.origin);endpoint.searchParams.set('action','owner-login');if(!reading)endpoint.searchParams.set('program',id);
  const form=document.createElement('form');form.method='POST';form.action=endpoint.href;form.hidden=true;
  for(const [name,value] of Object.entries({token,view:params.get('view')||'',next:params.get('next')||''})){const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;form.append(input);}
  document.body.append(form);form.submit();
 }catch(e){document.getElementById('message').textContent=e.message||'연결하지 못했습니다. 새로고침해 주세요.';}
}
connect();
})();

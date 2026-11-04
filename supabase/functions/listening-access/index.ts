const origin='https://2rimi0315-hub.github.io';
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
async function lookup(code:string){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode('listening-code:'+code)));}
const hash=async(s:string)=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
async function derive(code:string,salt:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(code),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256));}
async function db(path:string,method='GET',body?:unknown){const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;const r=await fetch(Deno.env.get('SUPABASE_URL')+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});if(!r.ok)throw Error('database');const text=await r.text();return text?JSON.parse(text):null;}
Deno.serve(async(req:Request)=>{
 const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type,authorization,x-admin-key','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
 const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json'}});
 if(req.headers.get('origin')&&req.headers.get('origin')!==origin)return reply({error:'허용되지 않은 요청입니다.'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'지원되지 않는 요청입니다.'},405);
 try{
  if(Number(req.headers.get('content-length')||0)>1024)return reply({error:'요청이 너무 큽니다.'},413);
  const raw=await req.text();if(raw.length>1024)return reply({error:'요청이 너무 큽니다.'},413);
  const b=JSON.parse(raw);
  const adminToken=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
  let adminSession=null;
  if(/^[a-f0-9]{64}$/.test(adminToken)){
   const rows=await db('chaeum_admin_sessions?token_hash=eq.'+await hash(adminToken)+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&select=expires_at');
   adminSession=rows[0]||null;
  }
  const adminView=()=>({role:'admin',label:'채움 관리자',accessId:'ae36aeda-98dd-4b71-b869-802f98ee468d',expiresAt:adminSession.expires_at});
  if(b.action==='admin-me')return adminSession?reply(adminView()):reply({error:'관리자 로그인이 만료되었습니다.'},401);
  if(b.action==='admin-logout'){
   if(!adminSession)return reply({error:'관리자 로그인이 필요합니다.'},401);
   await db('chaeum_admin_sessions?token_hash=eq.'+await hash(adminToken),'DELETE');return reply({ok:true});
  }
  if(adminSession&&b.action==='me')return reply(adminView());
  if(adminSession&&b.action==='logout'){
   await db('chaeum_admin_sessions?token_hash=eq.'+await hash(adminToken),'DELETE');return reply({ok:true});
  }


  if(typeof b.action==='string'&&b.action.startsWith('admin-')){
   const bucket=await hash('listening-admin:'+ (req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown'));
   if(!await db('rpc/chaeum_hub_allow_login','POST',{p_bucket:bucket,p_limit:100}))return reply({error:'관리자 요청이 많습니다. 잠시 후 다시 시도해 주세요.'},429);
   if(!adminSession||b.action==='admin-login'){
   const adminKey=req.headers.get('x-admin-key')||'';
   if(adminKey.length<16||adminKey.length>512)return reply({error:'관리자 비밀번호를 확인해 주세요.'},401);
   const auth=await fetch('https://stellar-sunburst-e87ec6.netlify.app/.netlify/functions/hub?action=admin-teachers',{headers:{'x-admin-key':adminKey},redirect:'error'});
   if(!auth.ok)return reply({error:auth.status===401?'관리자 비밀번호를 확인해 주세요.':'관리자 인증 서버에 연결하지 못했습니다.'},auth.status===401?401:503);
   const verified=await auth.json();if(!Array.isArray(verified.teachers))return reply({error:'관리자 인증을 확인하지 못했습니다.'},503);
   }
   if(b.action==='admin-login'){
    const token=hex(crypto.getRandomValues(new Uint8Array(32)).buffer),expiresAt=new Date(Date.now()+8*3600000).toISOString();
    await db('chaeum_admin_sessions','POST',{token_hash:await hash(token),expires_at:expiresAt});
    return reply({token,expiresAt,role:'admin',label:'채움 관리자'});
   }
   if(b.action==='admin-list')return reply({teachers:await db('chaeum_listening_access?select=id,label,active&order=label')});
   if(b.action==='admin-create'||b.action==='admin-reset'){
    let id=null,label=String(b.name||'').trim();
    if(b.action==='admin-reset'){
     if(!/^[0-9a-f-]{36}$/.test(b.id||''))return reply({error:'선생님을 선택해 주세요.'},400);
     const found=await db('chaeum_listening_access?id=eq.'+b.id+'&select=id,label');
     if(!found.length)return reply({error:'선생님을 찾지 못했습니다.'},404);id=found[0].id;label=found[0].label;
    }
    if(label.length<2||label.length>40)return reply({error:'선생님 이름을 2~40자로 입력해 주세요.'},400);
    for(let i=0;i<20;i++){
     let n;do{n=crypto.getRandomValues(new Uint32Array(1))[0];}while(n>=4294000000);
     const code=String(n%1000000).padStart(6,'0'),code_lookup=await lookup(code);
     if((await db('chaeum_listening_access?code_lookup=eq.'+code_lookup+'&select=id')).length)continue;
     const salt=hex(crypto.getRandomValues(new Uint8Array(16)).buffer),code_hash=await derive(code,salt);
     if(id){await db('chaeum_listening_access?id=eq.'+id,'PATCH',{salt,code_hash,code_lookup});await db('chaeum_listening_sessions?access_id=eq.'+id,'DELETE');}
     else await db('chaeum_listening_access','POST',{label,salt,code_hash,code_lookup});
     return reply({name:label,code});
    }
    return reply({error:'코드 발급을 다시 시도해 주세요.'},503);
   }
   if(b.action==='admin-active'){
    if(!/^[0-9a-f-]{36}$/.test(b.id||'')||typeof b.active!=='boolean')return reply({error:'선생님을 선택해 주세요.'},400);
    await db('chaeum_listening_access?id=eq.'+b.id,'PATCH',{active:b.active});
    await db('chaeum_listening_sessions?access_id=eq.'+b.id,'DELETE');
    return reply({ok:true});
   }
   return reply({error:'관리자 요청을 확인해 주세요.'},400);
  }

  if(b.action==='login'){
   // Atomic global limit remains effective even if an incoming IP header is spoofed.
   const global=await db('rpc/chaeum_hub_allow_login','POST',{p_bucket:await hash('listening-global-v1'),p_limit:40});
   if(!global)return reply({error:'로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.'},429);
   const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
   const allowed=await db('rpc/chaeum_hub_allow_login','POST',{p_bucket:await hash('listening-ip-v1:'+ip),p_limit:8});
   if(!allowed)return reply({error:'로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.'},429);
   if(typeof b.code!=='string'||!/^\d{6}$/.test(b.code))return reply({error:'6자리 숫자 코드를 입력해 주세요.'},401);
   const codeLookup=await lookup(b.code);
   const rows=await db('chaeum_listening_access?active=eq.true&or=(code_lookup.eq.'+codeLookup+',code_lookup.is.null)&select=id,label,salt,code_hash,code_lookup');
   let match=null;for(const row of rows){const result=await derive(b.code,row.salt);let diff=result.length^row.code_hash.length;for(let i=0;i<result.length;i++)diff|=result.charCodeAt(i)^row.code_hash.charCodeAt(i);if(diff===0)match=row;}
   if(!match)return reply({error:'로그인 코드를 확인해 주세요.'},401);
   if(match.code_lookup===null)await db('chaeum_listening_access?id=eq.'+match.id+'&code_lookup=is.null','PATCH',{code_lookup:codeLookup});
   const token=hex(crypto.getRandomValues(new Uint8Array(32)).buffer);const expiresAt=new Date(Date.now()+8*3600000).toISOString();
   await db('chaeum_listening_sessions','POST',{token_hash:await hash(token),access_id:match.id,expires_at:expiresAt});
   return reply({token,expiresAt,label:match.label,accessId:match.id});
  }
  const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
  if(!/^[a-f0-9]{64}$/.test(token))return reply({error:'로그인이 필요합니다.'},401);
  const digest=await hash(token);
  if(b.action==='logout'){await db('chaeum_listening_sessions?token_hash=eq.'+digest,'DELETE');return reply({ok:true});}
  if(b.action!=='me')return reply({error:'요청을 확인해 주세요.'},400);
  const sessions=await db('chaeum_listening_sessions?token_hash=eq.'+digest+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&select=access_id,expires_at');
  if(!sessions.length)return reply({error:'로그인이 만료되었습니다.'},401);
  const rows=await db('chaeum_listening_access?id=eq.'+sessions[0].access_id+'&active=eq.true&select=label');
  if(!rows.length)return reply({error:'사용이 중지된 코드입니다.'},401);
  return reply({label:rows[0].label,accessId:sessions[0].access_id,expiresAt:sessions[0].expires_at});
 }catch{return reply({error:'로그인 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'},503);}
});

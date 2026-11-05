const K_CH="autopix_chaves_v3",K_PG="autopix_pagamentos_v1",CIDADE="ITUMBIARA",UF="GO",TIPOS=["CPF","CNPJ","EMAIL","PHONE","EVP"];
const $=id=>document.getElementById(id);
function load(k){try{const a=JSON.parse(localStorage.getItem(k)||"[]");return Array.isArray(a)?a:[]}catch(e){return[]}}
let chaves=load(K_CH),pags=load(K_PG),filtro="todos",atual=null;
function save(){try{localStorage.setItem(K_CH,JSON.stringify(chaves));localStorage.setItem(K_PG,JSON.stringify(pags));return true}catch(e){alert("O navegador não permitiu salvar os dados.");return false}}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function newId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function fmt(v){return Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}
function dt(s){return new Date(s).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"})}
function showPage(p){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));$(p).classList.add("active");$("navInicio").classList.toggle("active",p==="inicio");$("navCadastro").classList.toggle("active",p==="cadastro");$("navRelatorio").classList.toggle("active",p==="relatorio");if(p==="inicio")renderPags();else if(p==="relatorio")renderRel();else render();scrollTo({top:0})}

/* ---------- validação ---------- */
function normPhone(v){const d=String(v).replace(/\D/g,"");return d.length>=12&&d.startsWith("55")?d:"55"+d}
function norm(t,v){v=v.trim();if(t==="CPF"||t==="CNPJ")return v.replace(/\D/g,"");if(t==="PHONE")return normPhone(v);if(t==="EMAIL"||t==="EVP")return v.toLowerCase();return v}
function cpfOk(s){if(!/^\d{11}$/.test(s)||/^(\d)\1+$/.test(s))return false;for(let t=9;t<11;t++){let d=0;for(let i=0;i<t;i++)d+=s[i]*(t+1-i);d=(d*10)%11%10;if(d!=s[t])return false}return true}
function cnpjOk(s){if(!/^\d{14}$/.test(s)||/^(\d)\1+$/.test(s))return false;for(let t=12;t<14;t++){let d=0,p=t-7;for(let i=0;i<t;i++){d+=s[i]*p--;if(p<2)p=9}d=d%11<2?0:11-d%11;if(d!=s[t])return false}return true}
function validate(t,k){if(!k)return"Informe a chave Pix.";if(t==="CPF"&&!cpfOk(k))return"CPF inválido (confira os dígitos).";if(t==="CNPJ"&&!cnpjOk(k))return"CNPJ inválido (confira os dígitos).";if(t==="PHONE"&&!/^55\d{10,11}$/.test(k))return"Celular inválido. Use DDD + número.";if(t==="EMAIL"&&(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(k)||k.length>77))return"E-mail inválido.";if(t==="EVP"&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(k))return"Chave aleatória inválida (formato 8-4-4-4-12).";return""}
function pixKey(c){return c.tipo==="PHONE"?"+"+normPhone(c.chave):c.chave}
function ascii(s){return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\x20-\x7E]/g,"").toUpperCase().replace(/\s+/g," ").trim()}
function parseValor(v){v=(v||"").trim().replace(/R\$|\s/g,"");if(!v)return"";if(v.includes(","))v=v.replace(/\./g,"").replace(",",".");else if(/^\d{1,3}(\.\d{3})+$/.test(v))v=v.replace(/\./g,"");if(!/^\d+(\.\d{1,2})?$/.test(v))return null;const n=Number(v);return n>0&&n<=9999999999.99?n.toFixed(2):null}

/* ---------- BR Code ---------- */
function crc(s){let c=0xFFFF;for(let i=0;i<s.length;i++){c^=s.charCodeAt(i)<<8;for(let j=0;j<8;j++)c=c&0x8000?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c.toString(16).toUpperCase().padStart(4,"0")}
function f(id,v){return id+String(v.length).padStart(2,"0")+v}
function payload(k,n,c,v,tx){const m=f("00","br.gov.bcb.pix")+f("01",k);let p=f("00","01")+f("01","11")+f("26",m)+f("52","0000")+f("53","986");if(v)p+=f("54",v);p+=f("58","BR")+f("59",ascii(n).substring(0,25).trim())+f("60",ascii(c).substring(0,15).trim())+f("62",f("05",tx||"***"));return p+"6304"+crc(p+"6304")}

/* ---------- pagamentos ---------- */
function novo(){
 if(!chaves.length){alert("Cadastre uma chave Pix primeiro.");return showPage("cadastro")}
 $("nChave").innerHTML=chaves.map(c=>`<option value="${esc(c.id)}">${esc(c.identificacao)} — ${esc(c.tipo)}</option>`).join("");
 histAlunos();$("nAlunos").innerHTML="";addAluno();$("nContato").value="";$("nObs").value="";$("nCat").value="Mensalidade";$("nDia").value="5";catChange();totalNovo();$("dNovo").showModal();$("nAlunos").querySelector(".an").focus()}
function catChange(){$("nDiaBox").classList.toggle("hidden",$("nCat").value!=="Mensalidade")}
function addAluno(){const d=document.createElement("div");d.className="arow";d.innerHTML='<input class="an" list="dlAlunos" placeholder="Nome do aluno" autocomplete="off" onchange="autoAluno(this)"><input class="av" inputmode="decimal" placeholder="Valor" oninput="totalNovo()"><button class="x" type="button" title="Remover" onclick="rmAluno(this)">×</button>';$("nAlunos").appendChild(d);if($("dNovo").open)d.querySelector(".an").focus()}
function rmAluno(b){if($("nAlunos").children.length>1){b.parentNode.remove();totalNovo()}}
function totalNovo(){let t=0;document.querySelectorAll("#nAlunos .av").forEach(i=>{const v=parseValor(i.value);if(v)t+=Math.round(Number(v)*100)});$("nTotal").textContent="R$ "+fmt(t/100)}
function criar(){
 const alunos=[],c=chaves.find(x=>x.id===$("nChave").value),ct=$("nContato").value.replace(/\D/g,"");let cents=0;
 for(const r of document.querySelectorAll("#nAlunos .arow")){
  const n=r.querySelector(".an").value.trim(),raw=r.querySelector(".av").value,v=parseValor(raw);
  if(!n&&!raw.trim())continue;
  if(!n)return alert("Informe o nome do aluno.");
  if(!v)return alert("Valor inválido para "+n+". Use por exemplo 150,00 ou 1.000,50.");
  alunos.push({nome:n,valor:v});cents+=Math.round(Number(v)*100)}
 if(!alunos.length)return alert("Adicione pelo menos um aluno com valor.");
 if(!c)return alert("Escolha uma chave Pix.");
 if(ct&&(ct.length<10||ct.length>13))return alert("Contato inválido. Use DDD + número.");
 const total=(cents/100).toFixed(2);if(cents>999999999999)return alert("Valor total muito alto.");
 const id=newId(),tx=("AP"+Date.now().toString(36)).toUpperCase().slice(0,25);
 pags.push({id,aluno:alunos.map(a=>a.nome).join(", "),alunos,obs:$("nObs").value.trim().slice(0,200),categoria:$("nCat").value==="Mensalidade"?"Mensalidade":"Outros",diaVenc:$("nCat").value==="Mensalidade"?Number($("nDia").value):null,contato:ct,valor:total,criado:new Date().toISOString(),pago:false,pagoEm:null,empresa:c.nomePix,recebedor:ascii(c.nomePix)+" · "+c.identificacao,code:payload(pixKey(c),c.nomePix,c.cidade,total,tx)});
 if(!save()){pags.pop();return}
 $("dNovo").close();renderPags();abrir(id)}
function renderPags(){
 const q=ascii($("busca").value),lista=pags.filter(p=>(filtro==="todos"||(filtro==="pago")===p.pago)&&(!q||ascii(p.aluno).includes(q))).sort((a,b)=>filtro==="pend"?a.criado.localeCompare(b.criado):b.criado.localeCompare(a.criado));
 $("listaPags").innerHTML=lista.length?lista.map(p=>`<div class="pg" onclick="abrir('${esc(p.id)}')"><button class="chk ${p.pago?"on":""}" title="${p.pago?"Desmarcar pago":"Marcar como pago"}" onclick="event.stopPropagation();alternarPago('${esc(p.id)}')">✓</button><div class="pg-main"><strong>${esc(p.aluno)}</strong><small>${catTxt(p)?esc(catTxt(p))+" · ":""}${dt(p.criado)}${p.obs?" · "+esc(p.obs):""}</small></div><div class="pg-side"><b>R$ ${fmt(p.valor)}</b><span class="badge ${p.pago?"pago":diasPend(p)>=5?"atraso":"pend"}">${p.pago?("Pago"+(p.pagoEm?" · "+new Date(p.pagoEm).toLocaleDateString("pt-BR"):"")):pendTxt(p)}</span></div>${p.pago?"":`<button class="chk" title="Cobrar pelo WhatsApp" onclick="event.stopPropagation();cobrar('${esc(p.id)}')">📲</button>`}</div>`).join(""):`<div class="vazio">${pags.length?"Nenhum pagamento encontrado.":"Nenhum pagamento gerado ainda.<br>Toque em “Gerar pagamento” para começar."}</div>`;
 const soma=b=>pags.filter(p=>p.pago===b).reduce((s,p)=>s+Number(p.valor),0);
 $("stPend").textContent="R$ "+fmt(soma(false));$("stPago").textContent="R$ "+fmt(soma(true))}
$("tabs").onclick=e=>{const b=e.target.closest("button");if(!b)return;filtro=b.dataset.f;document.querySelectorAll("#tabs button").forEach(x=>x.classList.toggle("on",x===b));renderPags()};
function get(id){return pags.find(p=>p.id===id)}
function abrir(id){
 const p=get(id);if(!p)return;atual=id;
 $("dAluno").textContent=p.aluno;$("dValor").textContent="R$ "+fmt(p.valor);$("dData").textContent=dt(p.criado);$("dRec").textContent=p.recebedor;$("dAlunos").innerHTML=(p.alunos&&p.alunos.length?p.alunos:[{nome:p.aluno,valor:p.valor}]).map(a=>esc(a.nome)+" — R$ "+fmt(a.valor)).join("<br>");$("dObs").textContent=p.obs||"—";$("dCat").textContent=catTxt(p)||"—";
 $("dCont").textContent=p.contato?"+"+normPhone(p.contato):"Não informado";$("pixCode").textContent=p.code;
 $("pagoData").value=p.pagoEm?String(p.pagoEm).slice(0,10):"";
 $("qrcode").innerHTML="";new QRCode($("qrcode"),{text:p.code,width:220,height:220,correctLevel:QRCode.CorrectLevel.M});
 statusDet();if(!$("dDet").open)$("dDet").showModal()}
function statusDet(){
 const p=get(atual);if(!p)return;
 $("dStatus").innerHTML=p.pago?`<span class="badge pago">Pago em ${dt(p.pagoEm)}</span>`:`<span class="badge pend">Pendente</span>`;
 const b=$("bPago");b.className=p.pago?"secondary":"ok";b.textContent=p.pago?"↩ Desmarcar como pago":"✓ Marcar como pago";$("bCobrar").classList.toggle("hidden",p.pago)}
function salvarDataPago(){const p=get(atual);if(!p)return;const data=$("pagoData").value;if(!data){alert("Escolha a data em que o pagamento foi realizado.");return;}p.pago=true;p.pagoEm=data+"T12:00:00";save();renderPags();statusDet();alert("Data do pagamento salva!")}
function alternarPago(id){const p=get(id);if(!p)return;p.pago=!p.pago;p.pagoEm=p.pago?new Date().toISOString():null;$("pagoData").value=p.pago?String(p.pagoEm).slice(0,10):"";save();renderPags();if($("dDet").open&&atual===id)statusDet()}
function excluirPag(){if(!confirm("Excluir este pagamento?"))return;pags=pags.filter(p=>p.id!==atual);save();$("dDet").close();renderPags()}
async function copiarPix(){const p=get(atual);if(!p)return;try{await navigator.clipboard.writeText(texto(p));alert("Mensagem copiada!")}catch(e){alert("Não foi possível copiar automaticamente.")}}
async function copiarCodigo(){const p=get(atual);if(!p)return;try{await navigator.clipboard.writeText(p.code);alert("Código Pix copiado!")}catch(e){alert("Não foi possível copiar automaticamente.")}}
function catTxt(p){return p.categoria==="Mensalidade"?"Mensalidade · dia "+p.diaVenc:(p.categoria||"")}
function empresa(p){return p.empresa||String(p.recebedor||"").split(" · ")[0]}
function texto(p){return `R$ ${fmt(p.valor)}   ${empresa(p)}\n*Enviar comprovante após pagamento*\nPix copia e cola 👇\n${p.code}`}
function enviarWpp(){const p=get(atual);if(!p)return;location.href="https://wa.me/"+(p.contato?normPhone(p.contato):"")+"?text="+encodeURIComponent(texto(p))}
async function compartilhar(){
 const p=get(atual);if(!p)return;const canvas=document.querySelector("#qrcode canvas");
 if(canvas&&navigator.share&&navigator.canShare){try{const blob=await new Promise(r=>canvas.toBlob(r,"image/png")),file=new File([blob],"qrcode-pix.png",{type:"image/png"});if(navigator.canShare({files:[file]})){await navigator.share({title:"Pagamento Pix",text:texto(p),files:[file]});return}}catch(e){if(e.name==="AbortError")return}}
 enviarWpp()}

/* ---------- chaves ---------- */
function salvarChave(){
 const id=$("editId").value,ident=$("identificacao").value.trim(),t=$("tipo").value,nome=$("nomePix").value.trim(),key=norm(t,$("chave").value);
 if(!ident||!nome)return alert("Preencha a identificação e o nome que aparece no Pix.");
 if(!ascii(nome))return alert("O nome do recebedor precisa ter letras ou números.");
 if(nome.length>25&&!confirm("O nome será cortado para: "+ascii(nome).substring(0,25)+"\nContinuar?"))return;
 const er=validate(t,key);if(er)return alert(er);
 const r={id:id||newId(),identificacao:ident,tipo:t,nomePix:nome,chave:key,cidade:CIDADE,uf:UF};
 if(id){const i=chaves.findIndex(x=>x.id===id);if(i>=0)chaves[i]=r}else chaves.push(r);
 if(save()){limparFormulario();render();alert("Chave salva com sucesso!")}}
function editar(id){const c=chaves.find(x=>x.id===id);if(!c)return;$("editId").value=c.id;$("identificacao").value=c.identificacao;$("tipo").value=c.tipo;$("nomePix").value=c.nomePix;$("chave").value=c.chave;scrollTo({top:0,behavior:"smooth"})}
function excluir(id){if(!confirm("Excluir esta chave Pix? Os pagamentos já gerados não são afetados."))return;chaves=chaves.filter(x=>x.id!==id);save();render()}
function limparFormulario(){$("editId").value="";$("identificacao").value="";$("tipo").value="CPF";$("nomePix").value="";$("chave").value=""}
function mask(c){if(c.tipo==="CPF"&&c.chave.length===11)return c.chave.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4");if(c.tipo==="CNPJ"&&c.chave.length===14)return c.chave.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,"$1.$2.$3/$4-$5");if(c.tipo==="PHONE")return"+"+normPhone(c.chave);return c.chave}
function render(){$("listaChaves").innerHTML=chaves.length?chaves.map(c=>`<div class="key-item"><div class="key-info"><strong>${esc(c.identificacao)}</strong><small>${esc(c.tipo)} · ${esc(c.nomePix)} · ${esc(mask(c))}</small></div><div class="actions" style="margin:0"><button class="secondary" onclick="editar('${esc(c.id)}')">Editar</button><button class="danger" onclick="excluir('${esc(c.id)}')">Excluir</button></div></div>`).join(""):"<p style='color:var(--mut)'>Nenhuma chave cadastrada.</p>"}

/* ---------- backup ---------- */
function exportar(){
 if(!chaves.length&&!pags.length)return alert("Não há dados para exportar.");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify({chaves,pagamentos:pags},null,2)],{type:"application/json"}));
 a.download="autopix-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function importar(inp){
 const file=inp.files[0];if(!file)return;const rd=new FileReader();
 rd.onload=()=>{try{
  const d=JSON.parse(rd.result),ac=Array.isArray(d)?d:d.chaves,ap=Array.isArray(d)?[]:d.pagamentos;let nc=0,np=0;
  (Array.isArray(ac)?ac:[]).forEach(x=>{
   if(!x||!TIPOS.includes(x.tipo)||typeof x.chave!=="string"||typeof x.nomePix!=="string"||typeof x.identificacao!=="string")return;
   const k=norm(x.tipo,x.chave);if(validate(x.tipo,k)||chaves.some(c=>c.tipo===x.tipo&&c.chave===k&&c.nomePix===x.nomePix))return;
   chaves.push({id:newId(),identificacao:x.identificacao.slice(0,60),tipo:x.tipo,nomePix:x.nomePix.slice(0,60),chave:k,cidade:CIDADE,uf:UF});nc++});
  (Array.isArray(ap)?ap:[]).forEach(x=>{
   if(!x||typeof x.aluno!=="string"||typeof x.code!=="string"||typeof x.criado!=="string"||isNaN(new Date(x.criado)))return;
   const v=parseValor(String(x.valor));if(!v)return;
   if(pags.some(p=>p.code===x.code&&p.criado===x.criado))return;
   pags.push({id:newId(),aluno:x.aluno.slice(0,80),contato:String(x.contato||"").replace(/\D/g,"").slice(0,13),valor:v,criado:new Date(x.criado).toISOString(),pago:!!x.pago,pagoEm:x.pago&&x.pagoEm&&!isNaN(new Date(x.pagoEm))?new Date(x.pagoEm).toISOString():null,recebedor:String(x.recebedor||"").slice(0,80),empresa:String(x.empresa||"").slice(0,60),categoria:x.categoria==="Mensalidade"?"Mensalidade":(x.categoria==="Outros"?"Outros":undefined),diaVenc:x.categoria==="Mensalidade"&&[5,10,15,20,25,30].includes(Number(x.diaVenc))?Number(x.diaVenc):null,obs:String(x.obs||"").slice(0,200),alunos:Array.isArray(x.alunos)?x.alunos.slice(0,30).map(a=>({nome:String(a&&a.nome||"").slice(0,80),valor:parseValor(String(a&&a.valor))||"0.00"})):undefined,code:x.code.slice(0,600)});np++});
  if(nc||np)save();render();renderPags();alert(nc+" chave(s) e "+np+" pagamento(s) importados.")
 }catch(e){alert("Arquivo inválido.")}inp.value=""};
 rd.readAsText(file)}
/* ---------- autocompletar pelo histórico ---------- */
let hist={};
function histAlunos(){hist={};[...pags].sort((a,b)=>a.criado.localeCompare(b.criado)).forEach(p=>(p.alunos&&p.alunos.length?p.alunos:[{nome:p.aluno,valor:p.valor}]).forEach(a=>{if(a.nome)hist[ascii(a.nome)]={nome:a.nome,valor:a.valor,contato:p.contato||""}}));$("dlAlunos").innerHTML=Object.values(hist).sort((a,b)=>a.nome.localeCompare(b.nome)).map(h=>`<option value="${esc(h.nome)}">`).join("")}
function autoAluno(i){const h=hist[ascii(i.value)];if(!h)return;const v=i.parentNode.querySelector(".av");i.value=h.nome;if(!v.value.trim()){v.value=fmt(h.valor);totalNovo()}if(h.contato&&!$("nContato").value.trim())$("nContato").value=h.contato}

/* ---------- pendências e cobrança ---------- */
function diasPend(p){return Math.floor((Date.now()-new Date(p.criado))/864e5)}
function pendTxt(p){const d=diasPend(p);return d>=1?"Pendente há "+d+(d===1?" dia":" dias"):"Pendente"}
function cobrar(id){const p=get(id);if(!p)return;const t=`Olá! Passando para lembrar do pagamento pendente de ${p.aluno} no valor de R$ ${fmt(p.valor)}${p.categoria==="Mensalidade"?" (mensalidade, vencimento dia "+p.diaVenc+")":""}.\n\n*Enviar comprovante após pagamento*\nPix copia e cola 👇\n${p.code}`;location.href="https://wa.me/"+(p.contato?normPhone(p.contato):"")+"?text="+encodeURIComponent(t)}

/* ---------- relatório ---------- */
const MES=["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
function mkey(iso){const d=new Date(iso);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")}
function mlabel(k){const a=k.split("-");return MES[a[1]-1]+"/"+a[0].slice(2)}
function brl(v){return"R$ "+fmt(v)}
function soma(a){return a.reduce((s,p)=>s+Math.round(Number(p.valor)*100),0)/100}
function curto(v){return v>=1000?(v/1000).toFixed(1).replace(/\.0$/,"").replace(".",",")+"k":String(Math.round(v))}
function periodo(){const m=$("relMes").value;return pags.filter(p=>m==="todos"||mkey(p.criado)===m)}
function renderRel(){
 const cur=mkey(new Date().toISOString()),sel=$("relMes"),old=sel.value||cur;
 const ks=[...new Set(pags.map(p=>mkey(p.criado)).concat(cur))].sort().reverse();
 sel.innerHTML='<option value="todos">Todo o período</option>'+ks.map(k=>`<option value="${k}">${mlabel(k)}</option>`).join("");
 sel.value=old==="todos"||ks.includes(old)?old:cur;
 const L=periodo(),rec=soma(L.filter(p=>p.pago)),pen=soma(L.filter(p=>!p.pago)),tot=Math.round((rec+pen)*100)/100;
 $("rGer").textContent=brl(tot);$("rGerN").textContent=L.length+(L.length===1?" pagamento":" pagamentos");
 $("rRec").textContent=brl(rec);$("rTaxa").textContent=(tot?Math.round(rec/tot*100):0)+"% do gerado";
 $("rPen").textContent=brl(pen);$("rPenN").textContent=L.filter(p=>!p.pago).length+" em aberto";
 $("rTick").textContent=brl(L.length?tot/L.length:0);$("rTickN").textContent="por pagamento";
 /* últimos 6 meses */
 const ms=[],n=new Date();for(let i=5;i>=0;i--){const x=new Date(n.getFullYear(),n.getMonth()-i,1);ms.push(x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0"))}
 const data=ms.map(k=>{const l=pags.filter(p=>mkey(p.criado)===k);return{k,r:soma(l.filter(p=>p.pago)),p:soma(l.filter(p=>!p.pago))}}),mx=Math.max(1,...data.map(d=>d.r+d.p));
 const W=600,base=190,top=34,bw=56,gap=(W-6*bw)/7;
 let svg='<svg viewBox="0 0 600 220" width="100%" role="img" aria-label="Recebido e pendente por mês"><line x1="0" x2="600" y1="'+base+'" y2="'+base+'" style="stroke:var(--line)"/>';
 data.forEach((d,i)=>{const x=gap+i*(bw+gap),hr=d.r/mx*(base-top),hp=d.p/mx*(base-top),t=d.r+d.p;
  svg+=`<rect x="${x}" y="${base-hr}" width="${bw}" height="${hr}" style="fill:var(--ok)"/><rect x="${x}" y="${base-hr-hp}" width="${bw}" height="${hp}" style="fill:var(--warn)"/>`;
  svg+=`<text x="${x+bw/2}" y="${base-hr-hp-8}" text-anchor="middle" style="fill:var(--txt);font-size:12px;font-weight:700">${t?curto(t):""}</text>`;
  svg+=`<text x="${x+bw/2}" y="${base+20}" text-anchor="middle" style="fill:${d.k===sel.value?"var(--acc2)":"var(--mut)"};font-size:12px;font-weight:700">${mlabel(d.k)}</text>`});
 $("gMeses").innerHTML=svg+"</svg>";
 /* categorias */
 const cats={};L.forEach(p=>{const c=p.categoria||"Sem categoria",o=cats[c]=cats[c]||{n:0,r:0,p:0};o.n++;o[p.pago?"r":"p"]+=Number(p.valor)});
 const en=Object.entries(cats).sort((a,b)=>b[1].r+b[1].p-a[1].r-a[1].p),cols=["#7c6cff","#38bdf8","#f472b6","#fbbf24"];
 if(!en.length)$("gCat").innerHTML='<div class="vazio">Sem pagamentos neste período.</div>';
 else{const R=60,C=2*Math.PI*R;let off=0,seg="";
  en.forEach((e,i)=>{const len=(e[1].r+e[1].p)/(tot||1)*C;seg+=`<circle r="${R}" cx="80" cy="80" fill="none" stroke="${cols[i%4]}" stroke-width="26" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-off}" transform="rotate(-90 80 80)"/>`;off+=len});
  $("gCat").innerHTML=`<div class="donut"><svg viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Distribuição por categoria">${seg}<text x="80" y="76" text-anchor="middle" style="fill:var(--mut);font-size:11px">Total</text><text x="80" y="94" text-anchor="middle" style="fill:var(--txt);font-size:14px;font-weight:800">${curto(tot)}</text></svg></div><div style="overflow-x:auto"><table class="t"><tr><th>Categoria</th><th>Qtd</th><th>Recebido</th><th>Pendente</th><th>%</th></tr>${en.map((e,i)=>`<tr><td><i class="dot" style="background:${cols[i%4]}"></i>${esc(e[0])}</td><td>${e[1].n}</td><td>${brl(e[1].r)}</td><td>${brl(e[1].p)}</td><td>${Math.round((e[1].r+e[1].p)/(tot||1)*100)}%</td></tr>`).join("")}</table></div>`}
 /* chaves */
 const ch={};L.forEach(p=>{const k=p.recebedor||"—",o=ch[k]=ch[k]||{r:0,p:0};o[p.pago?"r":"p"]+=Number(p.valor)});
 const ce=Object.entries(ch).sort((a,b)=>b[1].r+b[1].p-a[1].r-a[1].p),mc=Math.max(1,...ce.map(e=>e[1].r+e[1].p));
 $("gChave").innerHTML=ce.length?ce.map(e=>`<div class="bar"><div class="bl"><span>${esc(e[0])}</span><b>${brl(e[1].r+e[1].p)}</b></div><div class="bt"><i style="width:${e[1].r/mc*100}%;background:var(--ok)"></i><i style="width:${e[1].p/mc*100}%;background:var(--warn)"></i></div><small>Recebido ${brl(e[1].r)} · Pendente ${brl(e[1].p)}</small></div>`).join(""):'<div class="vazio">Sem pagamentos neste período.</div>';
 /* pendências (de todo o período) */
 const pend=pags.filter(p=>!p.pago).sort((a,b)=>a.criado.localeCompare(b.criado)).slice(0,8);
 $("gPend").innerHTML=pend.length?pend.map(p=>`<div class="pg" onclick="abrir('${esc(p.id)}')"><div class="pg-main"><strong>${esc(p.aluno)}</strong><small>${dt(p.criado)}</small></div><div class="pg-side"><b>${brl(p.valor)}</b><span class="badge ${diasPend(p)>=5?"atraso":"pend"}">${pendTxt(p)}</span></div><button class="chk" title="Cobrar pelo WhatsApp" onclick="event.stopPropagation();cobrar('${esc(p.id)}')">📲</button></div>`).join(""):'<div class="vazio">Nenhuma pendência. 🎉</div>'}
function exportarCsv(){
 const L=periodo().sort((a,b)=>a.criado.localeCompare(b.criado));if(!L.length)return alert("Não há dados neste período.");
 const q=v=>{let t=String(v==null?"":v);if(/^[=+\-@\t\r]/.test(t))t="'"+t;return'"'+t.replace(/"/g,'""')+'"'};
 const linhas=[["Data","Alunos","Categoria","Dia de vencimento","Observação","Valor","Status","Data do pagamento","Recebedor","Contato"]].concat(L.map(p=>[dt(p.criado),p.aluno,p.categoria||"",p.diaVenc||"",p.obs||"",fmt(p.valor),p.pago?"Pago":"Pendente",p.pagoEm?new Date(p.pagoEm).toLocaleDateString("pt-BR"):"",p.recebedor||"",p.contato?"+"+normPhone(p.contato):""]));
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+linhas.map(r=>r.map(q).join(";")).join("\r\n")],{type:"text/csv;charset=utf-8"}));
 a.download="autopix-relatorio-"+$("relMes").value+".csv";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

/* ---------- senha de acesso ---------- */
const PW_SHA="7ecac58a0f3a0019c517526c7881eb40feb753d6cd0719ecccea8eb69f7644ff",PW_C="3636023511cca";
function cyrb(s){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0,ch;i<s.length;i++){ch=s.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return(4294967296*(2097151&h2)+(h1>>>0)).toString(16)}
async function okSenha(v){if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")===PW_SHA}return cyrb(v)===PW_C}
let falhas=0,bloq=0;
async function destravar(){
 const agora=Date.now();if(agora<bloq){$("lockErr").textContent="Aguarde "+Math.ceil((bloq-agora)/1000)+"s...";return}
 if(await okSenha($("lockPin").value.trim())){falhas=0;try{sessionStorage.setItem("autopix_ok","1")}catch(e){}$("lock").classList.add("hidden");$("lockPin").value="";$("lockErr").textContent=""}
 else{falhas++;$("lockPin").value="";if(falhas>=3){const w=15*(falhas-2);bloq=Date.now()+w*1000;$("lockErr").textContent="Senha incorreta. Aguarde "+w+"s."}else $("lockErr").textContent="Senha incorreta."}}
function travar(){try{sessionStorage.removeItem("autopix_ok")}catch(e){}$("lock").classList.remove("hidden");$("lockPin").focus()}
function iniciarLock(){let ok=false;try{ok=sessionStorage.getItem("autopix_ok")==="1"}catch(e){}if(ok||/^#p=/.test(location.hash))$("lock").classList.add("hidden");else $("lockPin").focus()}
/* ---------- link de pagamento ---------- */
function baseUrl(){const c=localStorage.getItem("autopix_url");if(c)return c;return /^https?:$/.test(location.protocol)?location.origin+location.pathname:""}
function salvarUrl(){const v=$("cfgUrl").value.trim().split("#")[0];if(v&&!/^https:\/\/\S+$/.test(v))return alert("Use um endereço completo começando com https://");if(v)localStorage.setItem("autopix_url",v);else localStorage.removeItem("autopix_url");alert(v?"Endereço salvo!":"Endereço removido.")}
function linkDe(p){const b=baseUrl();if(!b)return"";return b.split("#")[0]+"#p="+btoa(unescape(encodeURIComponent(JSON.stringify({c:p.code,a:p.aluno})))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function pegaLink(){const p=get(atual);if(!p)return null;const l=linkDe(p);if(!l){alert("Para gerar links, hospede este arquivo em um site com https:// e informe o endereço na aba “Chaves Pix”, em “Link de pagamento”.");return null}return{p,l}}
async function copiarLink(){const r=pegaLink();if(!r)return;try{await navigator.clipboard.writeText(r.l);alert("Link copiado!")}catch(e){prompt("Copie o link:",r.l)}}
function enviarLink(){const r=pegaLink();if(!r)return;const t=`R$ ${fmt(r.p.valor)}   ${empresa(r.p)}\n*Enviar comprovante após pagamento*\nLink para pagar 👇\n${r.l}`;location.href="https://wa.me/"+(r.p.contato?normPhone(r.p.contato):"")+"?text="+encodeURIComponent(t)}
function tlv(s){const o={};let i=0;while(i+4<=s.length){const t=s.substr(i,2),l=parseInt(s.substr(i+2,2),10);if(isNaN(l))break;o[t]=s.substr(i+4,l);i+=4+l}return o}
let codigoP="";
function pagadorView(){
 const m=location.hash.match(/^#p=([\w-]+)/);if(!m)return;
 try{
  const d=JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g,"+").replace(/_/g,"/"))))),code=String(d.c||"");
  if(code.length>600||!/^[\x20-\x7E]+$/.test(code)||!code.startsWith("000201")||crc(code.slice(0,-4))!==code.slice(-4))throw 0;
  const t=tlv(code);codigoP=code;
  $("pgEmp").textContent=t["59"]||"Pix";$("pgVal").textContent=t["54"]?"R$ "+fmt(t["54"]):"Informe o valor combinado";$("pgAluno").textContent=String(d.a||"").slice(0,120);$("pgCode").textContent=code;
  new QRCode($("qrcodeP"),{text:code,width:240,height:240,correctLevel:QRCode.CorrectLevel.M});
 }catch(e){document.querySelectorAll("header,main:not(#pagador)").forEach(x=>x.classList.add("hidden"));$("pagador").classList.remove("hidden");$("pagador").innerHTML='<div class="card vazio">Link inválido ou incompleto. Peça um novo link.</div>';return}
 document.querySelectorAll("header,main:not(#pagador)").forEach(x=>x.classList.add("hidden"));$("pagador").classList.remove("hidden")}
async function copiarPagador(){try{await navigator.clipboard.writeText(codigoP);alert("Código Pix copiado! Abra o app do seu banco e use Pix Copia e Cola.")}catch(e){prompt("Copie o código:",codigoP)}}
render();renderPags();pagadorView();iniciarLock();$("cfgUrl").value=localStorage.getItem("autopix_url")||"";

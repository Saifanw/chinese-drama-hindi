// Add only dramas you have permission to promote. Replace the demo record below.
const dramas = [
 {slug:"sample-drama", hindi:"Sample Drama (Demo)", original:"Original title", genre:"Romance · Demo", synopsis:"Yeh sample listing hai. Isse publish karne se pehle licensed/official drama ki verified details se replace karein.", episodes:[{number:1,title:"Episode 1",url:"episode-sample-1.html"}]}
];
const cards=document.getElementById('cards');
function render(list){cards.innerHTML=list.map(d=>`<article class="card"><div class="poster" aria-hidden="true">▶</div><div class="card-content"><span class="pill">${escapeHtml(d.genre)}</span><h3>${escapeHtml(d.hindi)}</h3><p class="muted">${escapeHtml(d.original)}</p><p>${escapeHtml(d.synopsis)}</p><a class="btn" href="drama-${encodeURIComponent(d.slug)}.html">Drama details</a></div></article>`).join('')}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
document.getElementById('search').addEventListener('input',e=>{let q=e.target.value.toLowerCase();render(dramas.filter(d=>(d.hindi+' '+d.original+' '+d.genre).toLowerCase().includes(q)))});
document.getElementById('year').textContent=new Date().getFullYear();render(dramas);
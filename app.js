// Drama catalogue. Add only authorized/official content and links.
const dramas = [
 {slug:"gareeb-aadmi-food-system-hindi",hindi:"Gareeb Aadmi Aur Food System",english:"Poor Guy Time-Traveled to Ancient China",original:"Chinese title not yet verified",genre:"Chinese Short Drama · Hindi Dubbed",synopsis:"Ek gareeb aadmi prachin China ke akaal ke daur mein pahunch jata hai. Ek special food system ki madad se woh apne gaon aur biwi ko bhookh se bachane ki koshish karta hai.",episodes:[{number:1,title:"Full Video",url:"episode-gareeb-aadmi-food-system-1.html"}]}
];
const cards=document.getElementById('cards');
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(list){cards.innerHTML=list.map(d=>`<article class="card"><div class="poster" aria-hidden="true">▶</div><div class="card-content"><span class="pill">${escapeHtml(d.genre)}</span><h3>${escapeHtml(d.hindi)}</h3><p class="muted">${escapeHtml(d.english)}</p><p>${escapeHtml(d.synopsis)}</p><a class="btn" href="drama-${encodeURIComponent(d.slug)}.html">Drama details</a></div></article>`).join('')}
document.getElementById('search').addEventListener('input',e=>{let q=e.target.value.toLowerCase();render(dramas.filter(d=>(d.hindi+' '+d.english+' '+d.original+' '+d.genre).toLowerCase().includes(q)))});
document.getElementById('year').textContent=new Date().getFullYear();render(dramas);
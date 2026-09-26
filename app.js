import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* Replace these values with your Firebase Web App config. */
const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY",
  authDomain: "PASTE_YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "PASTE_YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "PASTE_YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "PASTE_YOUR_FIREBASE_APP_ID"
};

const videos = [
  {
    id:"gareeb-aadmi-food-system-1",
    slug:"gareeb-aadmi-food-system-hindi",
    title:"Gareeb Aadmi Aur Food System",
    english:"Poor Guy Time-Traveled to Ancient Famine, Unlocked Food System to Save Village & Wife!",
    description:"Ek gareeb aadmi prachin China ke akaal ke daur mein pahunch jata hai. Ek special food system ki madad se woh apne gaon aur apni biwi ko bachane ki koshish karta hai.",
    categories:["time-travel","system"],
    label:"Hindi Dubbed",
    youtubeId:"EUXH7QQz_KE",
    thumbnail:"https://i.ytimg.com/vi/EUXH7QQz_KE/hqdefault.jpg"
  }
  // Add future videos here.
];

const grid=document.getElementById("videoGrid"), search=document.getElementById("search"), count=document.getElementById("count"), empty=document.getElementById("empty");
const modal=document.getElementById("videoModal"), playerWrap=document.getElementById("playerWrap");
let activeFilter="all", currentVideo=null, unsubscribeComments=null;

const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tagName=s=>s==="time-travel"?"Time Travel":s==="system"?"System":s[0].toUpperCase()+s.slice(1);

function render(){
  const q=search.value.trim().toLowerCase();
  const list=videos.filter(v=>{
    const matchesFilter=activeFilter==="all"||v.categories.includes(activeFilter);
    const hay=(v.title+" "+v.english+" "+v.description+" "+v.categories.join(" ")).toLowerCase();
    return matchesFilter&&hay.includes(q);
  });
  count.textContent=`${list.length} video${list.length!==1?"s":""}`;
  empty.hidden=list.length>0;
  grid.innerHTML=list.map(v=>`<article class="video-card" data-id="${esc(v.id)}">
    <div class="thumb"><img src="${esc(v.thumbnail)}" alt="${esc(v.title)} thumbnail" loading="lazy"><span class="play">▶</span></div>
    <div class="card-body"><div class="tags"><span class="tag">${esc(v.label)}</span>${v.categories.map(c=>`<span class="tag">${esc(tagName(c))}</span>`).join("")}</div>
    <h3>${esc(v.title)}</h3><p class="eng">${esc(v.english)}</p><div class="meta">▶ Watch on this website · 💬 Comments</div></div></article>`).join("");
}
grid.addEventListener("click",e=>{const card=e.target.closest(".video-card");if(card) openVideo(card.dataset.id)});
search.addEventListener("input",render);
document.querySelectorAll(".filter,.category").forEach(b=>b.addEventListener("click",()=>{
  activeFilter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===activeFilter));render();
}));

function openVideo(id){
  currentVideo=videos.find(v=>v.id===id); if(!currentVideo)return;
  document.getElementById("modalTitle").textContent=currentVideo.title;
  document.getElementById("modalEnglish").textContent=currentVideo.english;
  document.getElementById("modalDescription").textContent=currentVideo.description;
  document.getElementById("modalTags").innerHTML=currentVideo.categories.map(c=>`<span class="tag">${esc(tagName(c))}</span>`).join("");
  // The player stays inside this site; the source is YouTube, so YouTube controls/branding may still appear inside the player.
  playerWrap.innerHTML=`<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(currentVideo.youtubeId)}?rel=0&modestbranding=1" title="${esc(currentVideo.english)}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share" allowfullscreen></iframe></div>`;
  modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";
  startComments(currentVideo.id);
}
function closeModal(){
  modal.classList.remove("open");modal.setAttribute("aria-hidden","true");playerWrap.innerHTML="";document.body.style.overflow="";
  if(unsubscribeComments){unsubscribeComments();unsubscribeComments=null}
}
document.querySelectorAll("[data-close]").forEach(x=>x.addEventListener("click",closeModal));
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});

let db=null;
try{
  if(!firebaseConfig.apiKey.startsWith("PASTE_")){
    const app=initializeApp(firebaseConfig); db=getFirestore(app);
  }
}catch(err){console.warn("Firebase not configured:",err)}

function startComments(videoId){
  const list=document.getElementById("commentsList"), status=document.getElementById("commentStatus"), countEl=document.getElementById("commentCount");
  list.innerHTML="<p class='status'>Comments loading…</p>";countEl.textContent="";
  if(!db){list.innerHTML="<p class='status'>Comments backend abhi connect nahi hua.</p>";return}
  try{
    const q=query(collection(db,"comments"),where("videoId","==",videoId),orderBy("createdAt","desc"));
    unsubscribeComments=onSnapshot(q,snap=>{
      countEl.textContent=`(${snap.size})`;
      list.innerHTML=snap.empty?"<p class='status'>Abhi koi comment nahi hai. Pehla comment karein.</p>":snap.docs.map(d=>{const x=d.data();const date=x.createdAt?.toDate?.();return `<div class="comment"><strong>${esc(x.name||"Anonymous")}</strong>${date?`<small>${esc(date.toLocaleString())}</small>`:""}<p>${esc(x.text||"")}</p></div>`}).join("");
    },err=>{console.error(err);list.innerHTML="<p class='status'>Comments load nahi ho paaye.</p>"});
  }catch(e){list.innerHTML="<p class='status'>Comments setup check karein.</p>"}
}

document.getElementById("commentForm").addEventListener("submit",async e=>{
  e.preventDefault();const status=document.getElementById("commentStatus");status.textContent="";
  if(!db){status.textContent="Firebase comments connect nahi hua.";return}
  const name=document.getElementById("commentName").value.trim(), text=document.getElementById("commentText").value.trim();
  if(!name||!text||!currentVideo)return;
  try{
    await addDoc(collection(db,"comments"),{videoId:currentVideo.id,name:name.slice(0,50),text:text.slice(0,1000),createdAt:serverTimestamp()});
    document.getElementById("commentText").value="";status.textContent="Comment posted.";
  }catch(err){console.error(err);status.textContent="Comment post nahi ho paaya."}
});
document.getElementById("year").textContent=new Date().getFullYear();
render();

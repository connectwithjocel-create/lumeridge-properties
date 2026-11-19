/* LUMERIDGE PROPERTIES — shared logic (vanilla JS).
   Requires window.LM_DATA (central listing dataset) defined before this script. */
(function(){
"use strict";
var root=document.querySelector(".lm");if(!root||!window.LM_DATA)return;
root.classList.remove("no-js");
var D=window.LM_DATA,P=D.props,BY={};P.forEach(function(p){BY[p.id]=p});
var MODE=root.getAttribute("data-lm-mode")||"static";
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var $=function(s,c){return(c||root).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||root).querySelectorAll(s))};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var link=function(slug,q){return(MODE==="ghl"?(slug==="index"?"/":"/"+slug):slug+".html")+(q?"?"+q:"")};
var img=function(id,w,h){return "https://images.unsplash.com/photo-"+id+"?auto=format&fit=crop&q=72&w="+w+"&h="+h};
var money=function(n){return "$"+Number(n).toLocaleString("en-US")};
var priceTxt=function(p){return p.price==null?esc(p.priceText):money(p.price)+(p.listing==="rent"?'<small>/mo</small>':"")};
var LBL={sale:"For Sale",rent:"For Rent",lease:"For Lease"};
var ICO=function(d){return '<svg class="lm-ico" viewBox="0 0 24 24" aria-hidden="true">'+d+'</svg>'};
var I={heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
 pin:'<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
 bed:'<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
 bath:'<path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.68 3 4 3.68 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5M10 5 8 7M2 12h20M7 19v2M17 19v2"/>',
 area:'<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
 arrow:'<path d="M5 12h14M12 5l7 7-7 7"/>',x:'<path d="M18 6 6 18M6 6l12 12"/>',
 search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 left:'<path d="m15 18-6-6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',
 check:'<path d="M21.8 10A10 10 0 1 1 17 3.33"/><path d="m9 11 3 3L22 4"/>',
 brief:'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
 home:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 car:'<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
 cal:'<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>'};

/* ---------- Saved properties (localStorage with in-memory fallback) ---------- */
var mem=null,saved;
try{saved=JSON.parse(localStorage.getItem("lumeridge_saved")||"[]")}catch(e){saved=[]}
saved=saved.filter(function(id){return BY[id]});
var persist=function(){try{localStorage.setItem("lumeridge_saved",JSON.stringify(saved))}catch(e){mem=saved}};
function syncSaved(bump){
  $$("[data-lm-count]").forEach(function(c){c.textContent=saved.length;c.classList.toggle("is-on",saved.length>0);if(bump&&saved.length){c.classList.remove("bump");void c.offsetWidth;c.classList.add("bump")}});
  $$("[data-lm-save]").forEach(function(b){var id=b.getAttribute("data-lm-save"),on=saved.indexOf(id)>-1,p=BY[id];b.setAttribute("aria-pressed",on?"true":"false");if(p)b.setAttribute("aria-label",(on?"Remove ":"Save ")+p.name+(on?" from":" to")+" saved properties")});
  renderSavedPage();
}
function toggleSave(id,btn){var i=saved.indexOf(id),p=BY[id];
  if(i>-1){saved.splice(i,1);toast(p,"Removed from saved properties")}else{saved.push(id);toast(p,"Saved to your list",link("saved"),"View saved")}
  persist();syncSaved(i<0);if(btn){btn.classList.remove("pop");void btn.offsetWidth;btn.classList.add("pop")}}
var tEl,tT;
function toast(p,msg,href,cta){if(!tEl){tEl=document.createElement("div");tEl.className="lm-toast";tEl.setAttribute("role","status");tEl.setAttribute("aria-live","polite");root.appendChild(tEl)}
  tEl.innerHTML=(p?'<img src="'+img(p.img,104,78)+'" alt="">':"")+'<span><b>'+esc(msg)+'</b>'+(p?'<br><span style="opacity:.8">'+esc(p.name)+'</span>':"")+'</span>'+(href?'<a href="'+href+'">'+esc(cta)+'</a>':"");
  tEl.classList.add("is-on");clearTimeout(tT);tT=setTimeout(function(){tEl.classList.remove("is-on")},3000)}

/* ---------- Card template ---------- */
function specs(p){return p.group==="commercial"
  ?'<li>'+ICO(I.area)+p.sqft.toLocaleString()+' sq ft</li><li>'+ICO(I.brief)+esc(p.use)+'</li>'
  :'<li>'+ICO(I.bed)+(p.beds===0?"Studio":p.beds+" bd")+'</li><li>'+ICO(I.bath)+p.baths+' ba</li><li>'+ICO(I.area)+p.sqft.toLocaleString()+' sq ft</li>'}
function card(p){
  return '<article class="lm-card"><div class="lm-card-media"><div class="lm-tags"><span class="lm-tag">'+LBL[p.listing]+'</span>'+(p.lux?'<span class="lm-tag lm-tag-gold">Luxury</span>':"")+'</div>'+
  '<img src="'+img(p.img,800,600)+'" srcset="'+img(p.img,480,360)+' 480w, '+img(p.img,800,600)+' 800w, '+img(p.img,1200,900)+' 1200w" sizes="(max-width:600px) 100vw, (max-width:960px) 50vw, 320px" width="800" height="600" loading="lazy" decoding="async" alt="'+esc(p.alt)+'">'+
  '<button type="button" class="lm-save" data-lm-save="'+p.id+'" aria-pressed="false" aria-label="Save '+esc(p.name)+'">'+ICO(I.heart)+'</button></div>'+
  '<div class="lm-card-body"><div class="lm-card-price">'+priceTxt(p)+'</div><h3 class="lm-card-name"><a href="'+link("property","id="+p.id)+'">'+esc(p.name)+'</a></h3>'+
  '<p class="lm-card-loc">'+ICO(I.pin)+esc(p.city)+', FL · '+esc(p.type)+'</p><ul class="lm-specs">'+specs(p)+'</ul>'+
  '<div class="lm-card-cta"><span>View Details '+ICO(I.arrow)+'</span></div></div></article>'}
function fill(scope){$$("[data-lm-props]",scope).forEach(function(g){var ids=g.getAttribute("data-lm-props").split(",").filter(function(i){return BY[i]});if(ids.length)g.innerHTML=ids.map(function(i){return card(BY[i])}).join("")});syncSaved()}

root.addEventListener("click",function(e){var b=e.target.closest("[data-lm-save]");if(b){e.preventDefault();toggleSave(b.getAttribute("data-lm-save"),b)}});

/* ---------- Header, drawer, search overlay ---------- */
var hdr=$(".lm-header");if(hdr){var s=function(){hdr.classList.toggle("is-stuck",scrollY>30)};addEventListener("scroll",s,{passive:true});s()}
function trap(e,box){if(e.key!=="Tab")return;var f=$$("a[href],button,input,select,textarea",box).filter(function(x){return x.offsetParent!==null});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
function panel(el,openers){if(!el)return;var last;
  var open=function(){last=document.activeElement;el.classList.add("is-open");el.removeAttribute("aria-hidden");document.body.style.overflow="hidden";openers.forEach(function(o){o.setAttribute("aria-expanded","true")});var f=$("input,button",el);setTimeout(function(){f&&f.focus()},60)};
  var close=function(){el.classList.remove("is-open");el.setAttribute("aria-hidden","true");document.body.style.overflow="";openers.forEach(function(o){o.setAttribute("aria-expanded","false")});last&&last.focus()};
  openers.forEach(function(o){o.addEventListener("click",open)});$$("[data-lm-close]",el).forEach(function(c){c.addEventListener("click",close)});
  el.addEventListener("keydown",function(e){if(e.key==="Escape")close();trap(e,el)})}
panel($(".lm-drawer"),$$("[data-lm-open=menu]"));panel($(".lm-search"),$$("[data-lm-open=search]"));
var sb=$(".lm-search");if(sb){var si=$("input",sb),sr=$(".lm-sres",sb);
  si.addEventListener("input",function(){var q=si.value.trim().toLowerCase();if(q.length<2){sr.innerHTML="";return}
    var r=P.filter(function(p){return(p.name+" "+p.city+" "+p.type+" "+p.hood+" "+LBL[p.listing]).toLowerCase().indexOf(q)>-1}).slice(0,6);
    sr.innerHTML=r.length?r.map(function(p){return '<a href="'+link("property","id="+p.id)+'"><img src="'+img(p.img,144,108)+'" alt=""><span><b>'+esc(p.name)+'</b><span>'+esc(p.city)+' · '+(p.price==null?esc(p.priceText):money(p.price)+(p.listing==="rent"?"/mo":""))+'</span></span></a>'}).join(""):'<p style="color:var(--muted)">No listings match “'+esc(si.value)+'”. Try “Miami”, “villa” or “condo”.</p>'});
  $("form",sb).addEventListener("submit",function(e){e.preventDefault();location.href=link("properties","q="+encodeURIComponent(si.value.trim()))})}

/* ---------- Reveal ---------- */
var rv=$$(".lm-rv");if(!("IntersectionObserver" in window)||reduce)rv.forEach(function(e){e.classList.add("is-in")});
else{var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("is-in");io.unobserve(en.target)}})},{rootMargin:"0px 0px -8% 0px",threshold:.06});rv.forEach(function(e){io.observe(e)})}

/* ---------- Home search panel → properties page ---------- */
var fd=$("[data-lm-finder]");if(fd){var lt="sale";$$("[data-lm-tab]",fd).forEach(function(b){b.addEventListener("click",function(){lt=b.getAttribute("data-lm-tab");$$("[data-lm-tab]",fd).forEach(function(x){x.setAttribute("aria-pressed",x===b?"true":"false")})})});
  $("form",fd).addEventListener("submit",function(e){e.preventDefault();var u=new URLSearchParams();u.set("listing",lt);["city","group","min","max","beds"].forEach(function(k){var v=$("[name="+k+"]",fd).value;if(v)u.set(k,v)});location.href=link("properties",u.toString())})}

/* ---------- Listings engine ---------- */
var L=$("[data-lm-list]");
if(L){
  var pre=JSON.parse(L.getAttribute("data-lm-preset")||"{}"),qs=new URLSearchParams(location.search);
  var def={q:"",listing:"all",city:"",group:"",min:"",max:"",beds:"",lux:false,sort:"featured"};
  var st={};Object.keys(def).forEach(function(k){st[k]=pre[k]!==undefined?pre[k]:def[k]});
  ["q","listing","city","group","min","max","beds","sort"].forEach(function(k){if(qs.get(k))st[k]=qs.get(k)});
  var g=$("[data-lm-grid]",L),cnt=$("[data-lm-count-res]",L),chips=$("[data-lm-chips]",L),fl=$(".lm-filters",L);
  var ctl={q:$("#lm-q",L),city:$("#lm-city",L),group:$("#lm-group",L),min:$("#lm-min",L),max:$("#lm-max",L),beds:$("#lm-beds",L),sort:$("#lm-sort",L)};
  var setCtl=function(){Object.keys(ctl).forEach(function(k){ctl[k].value=st[k]});$$("[data-lm-listing]",L).forEach(function(b){b.setAttribute("aria-pressed",b.getAttribute("data-lm-listing")===st.listing?"true":"false")});$$("[data-lm-cat]",L).forEach(function(b){b.setAttribute("aria-pressed",b.getAttribute("data-lm-cat")===st.group?"true":"false")})};
  Object.keys(ctl).forEach(function(k){ctl[k].addEventListener(k==="q"?"input":"change",function(){st[k]=ctl[k].value;run(true)})});
  $$("[data-lm-listing]",L).forEach(function(b){b.addEventListener("click",function(){st.listing=b.getAttribute("data-lm-listing");run(true)})});
  $$("[data-lm-cat]",L).forEach(function(b){b.addEventListener("click",function(){st.group=b.getAttribute("data-lm-cat");run(true)})});
  var reset=function(){Object.keys(def).forEach(function(k){st[k]=pre[k]!==undefined?pre[k]:def[k]});run(true)};
  $$("[data-lm-reset]",L).forEach(function(b){b.addEventListener("click",reset)});
  $$("[data-lm-fopen]",L).forEach(function(b){b.addEventListener("click",function(){fl.classList.add("is-open");b.setAttribute("aria-expanded","true");$("input,select,button",fl).focus()})});
  $$("[data-lm-fclose]",L).forEach(function(b){b.addEventListener("click",function(){fl.classList.remove("is-open");$$("[data-lm-fopen]",L).forEach(function(o){o.setAttribute("aria-expanded","false")})})});
  chips.addEventListener("click",function(e){var b=e.target.closest("[data-clear]");if(!b)return;var k=b.getAttribute("data-clear");if(k==="all")return reset();st[k]=def[k];run(true)});
  var labels={city:function(v){return v},group:function(v){return D.groups[v]},listing:function(v){return LBL[v]},min:function(v){return "Min "+money(v)},max:function(v){return "Max "+money(v)},beds:function(v){return v+"+ beds"},q:function(v){return "“"+v+"”"}};
  function run(fade){
    var q=String(st.q).trim().toLowerCase(),mn=+st.min||0,mx=+st.max||0,bd=+st.beds||0;
    var list=P.filter(function(p){
      if(st.listing!=="all"&&p.listing!==st.listing)return false;
      if(st.city&&p.city!==st.city)return false;
      if(st.group&&p.group!==st.group)return false;
      if(st.lux&&!p.lux)return false;
      if((mn||mx)&&p.price==null)return false;
      if(mn&&p.price<mn)return false;if(mx&&p.price>mx)return false;
      if(bd&&(p.beds==null||p.beds<bd))return false;
      if(q&&(p.name+" "+p.city+" "+p.type+" "+p.hood+" "+p.short+" "+p.feats.join(" ")).toLowerCase().indexOf(q)<0)return false;
      return true});
    var pv=function(p){return p.price==null?Infinity:p.price};
    if(st.sort==="price-asc")list.sort(function(a,b){return pv(a)-pv(b)});
    if(st.sort==="price-desc")list.sort(function(a,b){return(b.price==null?-1:b.price)-(a.price==null?-1:a.price)});
    if(st.sort==="sqft")list.sort(function(a,b){return b.sqft-a.sqft});
    if(st.sort==="beds")list.sort(function(a,b){return(b.beds||0)-(a.beds||0)});
    setCtl();
    cnt.innerHTML="<b>"+list.length+"</b> "+(list.length===1?"property":"properties")+" found";
    var c="";["listing","city","group","min","max","beds","q"].forEach(function(k){if(st[k]&&st[k]!=="all"&&st[k]!==pre[k])c+='<span class="lm-chip">'+esc(labels[k](st[k]))+' <button type="button" data-clear="'+k+'" aria-label="Remove filter">×</button></span>'});
    if(c)c+='<button type="button" class="lm-txt" data-clear="all">Reset filters</button>';chips.innerHTML=c;
    var draw=function(){g.innerHTML=list.length?list.map(card).join(""):'<div class="lm-empty">'+ICO(I.search)+'<h3>No properties match your filters</h3><p style="color:var(--muted)">Try widening the price range, choosing a different city or clearing the search.</p><button type="button" class="lm-btn lm-btn-line" data-lm-reset-in>Reset Filters</button></div>';
      var r=$("[data-lm-reset-in]",g);if(r)r.addEventListener("click",reset);syncSaved();g.classList.remove("is-fading")};
    if(fade&&!reduce){g.classList.add("is-fading");setTimeout(draw,160)}else draw();
    var u=new URLSearchParams();["q","listing","city","group","min","max","beds"].forEach(function(k){if(st[k]&&st[k]!=="all"&&st[k]!==pre[k])u.set(k,st[k])});try{history.replaceState(null,"",location.pathname+(u.toString()?"?"+u:""))}catch(e){}
  }
  run(false);
}

/* ---------- Property detail ---------- */
var pd=$("[data-lm-pd]");
if(pd){var id=new URLSearchParams(location.search).get("id")||P[0].id,p=BY[id];
  if(!p){pd.innerHTML='<div class="lm-empty"><h2>Listing not found</h2><p style="color:var(--muted)">This listing may no longer be available. Browse all properties instead.</p><a class="lm-btn lm-btn-navy" href="'+link("properties")+'">Browse Properties</a></div>'}
  else{
    document.title=p.name+" — "+p.type+" in "+p.city+", FL | Lumeridge";
    var md=document.querySelector('meta[name="description"]');if(md)md.setAttribute("content",p.short+" View details, photos and amenities on Lumeridge Properties.");
    var cr=$("[data-lm-crumb]");if(cr)cr.textContent=p.name;
    /* Structured data omits Offer/price/availability until live listing data is connected */
    var ld=document.createElement("script");ld.type="application/ld+json";ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"WebPage","name":p.name,"description":p.short,"primaryImageOfPage":img(p.img,1200,900),"about":{"@type":"Place","name":p.name,"address":{"@type":"PostalAddress","addressLocality":p.city,"addressRegion":"FL","addressCountry":"US"}}});document.head.appendChild(ld);
    var gal=[{id:p.img,alt:p.alt}].concat(p.gal);
    var key=p.group==="commercial"
      ?[["area",p.sqft.toLocaleString(),"Sq ft"],["brief",p.use.split(" ")[0],"Use"],["car",p.parking.split(" ")[0],"Parking"],["cal",p.year,"Built"]]
      :[["bed",p.beds===0?"Studio":p.beds,"Beds"],["bath",p.baths,"Baths"],["area",p.sqft.toLocaleString(),"Sq ft"],["cal",p.year,"Built"]];
    var rows=[["Listing",LBL[p.listing]],["Property type",p.type],["City",p.city+", Florida"],["Area",p.hood+" (general)"],["Interior",p.sqft.toLocaleString()+" sq ft"]];
    if(p.lot)rows.push(["Lot size",p.lot]);if(p.group!=="commercial"){rows.push(["Bedrooms",p.beds===0?"Studio":p.beds],["Bathrooms",p.baths])}else{rows.push(["Use",p.use],["Zoning",p.zoning])}
    rows.push(["Parking",p.parking],["Year built",p.year],["Listing ID",p.ref]);
    var ck=function(a){return a.map(function(x){return "<li>"+ICO(I.check)+"<span>"+esc(x)+"</span></li>"}).join("")};
    pd.innerHTML='<div class="lm-pd-head"><div><div class="lm-tags" style="position:static;margin-bottom:12px"><span class="lm-tag">'+LBL[p.listing]+'</span>'+(p.lux?'<span class="lm-tag lm-tag-gold">Luxury Collection</span>':"")+'</div><h1>'+esc(p.name)+'</h1><p class="lm-card-loc" style="margin:0">'+ICO(I.pin)+esc(p.hood)+', '+esc(p.city)+', FL · '+esc(p.type)+'</p></div>'+
     '<div class="lm-pd-price"><small>'+(p.listing==="sale"?"Asking price":p.listing==="rent"?"Monthly rent":"Terms")+'</small>'+priceTxt(p)+'</div></div>'+
     '<div class="lm-gal"><div class="lm-stage" aria-roledescription="carousel" aria-label="Property photos">'+gal.map(function(x,i){return '<img src="'+img(x.id,1600,1000)+'" alt="'+esc(x.alt)+'" class="'+(i?"":"is-on")+'"'+(i?' loading="lazy"':' fetchpriority="high"')+'>'}).join("")+
     '<button type="button" class="lm-gnav lm-gprev" aria-label="Previous photo">'+ICO(I.left)+'</button><button type="button" class="lm-gnav lm-gnext" aria-label="Next photo">'+ICO(I.right)+'</button><span class="lm-gcount" aria-live="polite">1 / '+gal.length+'</span></div>'+
     '<div class="lm-thumbs">'+gal.map(function(x,i){return '<button type="button" aria-pressed="'+(i?"false":"true")+'" aria-label="Show photo '+(i+1)+'"><img src="'+img(x.id,300,225)+'" alt="" loading="lazy"></button>'}).join("")+'</div></div>'+
     '<div class="lm-pd"><div><div class="lm-keyfacts">'+key.map(function(k){return '<div>'+ICO(I[k[0]])+'<span><b>'+esc(k[1])+'</b><span>'+k[2]+'</span></span></div>'}).join("")+'</div>'+
     '<h2 style="margin-top:0">About this property</h2><p style="font-size:1.05rem">'+esc(p.desc)+'</p>'+
     '<h2>Specifications</h2><table class="lm-spec-table">'+rows.map(function(r){return '<tr><th>'+r[0]+'</th><td>'+esc(r[1])+'</td></tr>'}).join("")+'</table>'+
     '<h2>Features</h2><ul class="lm-checks">'+ck(p.feats)+'</ul><h2>Amenities</h2><ul class="lm-checks">'+ck(p.amen)+'</ul>'+
     '<div class="lm-callout" style="margin-top:34px"><p><strong>Listing information.</strong> Details are believed accurate but should be independently verified. Prices, availability and terms may change without notice.</p></div></div>'+
     '<aside class="lm-aside"><div class="lm-box lm-box-navy" id="inquire"><h3>Inquire About This Property</h3><p style="font-size:.9rem">Send a question or request a viewing.</p>'+
     '<form class="lm-form" data-lm-form data-done="#lm-pd-done" novalidate><input type="hidden" name="property_of_interest" value="'+esc(p.name)+'" data-label="Property" data-sum>'+
     '<div class="lm-f"><label for="pd-name">Name <i aria-hidden="true">*</i></label><input id="pd-name" name="full_name" required data-label="Name" data-sum autocomplete="name"><span class="lm-err"></span></div>'+
     '<div class="lm-f"><label for="pd-email">Email <i aria-hidden="true">*</i></label><input id="pd-email" type="email" name="email" required data-label="Email" data-sum autocomplete="email"><span class="lm-err"></span></div>'+
     '<div class="lm-f"><label for="pd-phone">Phone <small>(optional)</small></label><input id="pd-phone" type="tel" name="phone" data-label="Phone" data-sum autocomplete="tel"><span class="lm-err"></span></div>'+
     '<div class="lm-f"><label for="pd-type">Inquiry type <i aria-hidden="true">*</i></label><select id="pd-type" name="inquiry_type" required data-label="Inquiry type" data-sum><option value="">Select…</option><option>Request more information</option><option>Schedule a viewing</option><option>Pricing question</option></select><span class="lm-err"></span></div>'+
     '<div class="lm-f"><label for="pd-msg">Message <i aria-hidden="true">*</i></label><textarea id="pd-msg" name="message" required minlength="10" data-label="Message" style="min-height:96px">I’d like more information about '+esc(p.name)+'.</textarea><span class="lm-err"></span></div>'+
     '<div class="lm-f"><label class="lm-check"><input type="checkbox" name="consent" required data-label="Consent"><span>I agree to be contacted about this inquiry and accept the Privacy Policy. <i aria-hidden="true">*</i></span></label><span class="lm-err"></span></div>'+
     '<button type="submit" class="lm-btn lm-btn-gold lm-btn-block">Send Inquiry</button></form>'+
     '<div class="lm-done" id="lm-pd-done" role="status">'+ICO(I.check)+'<h3>Thank you</h3><p style="font-size:.9rem">Here is a summary of your inquiry.</p><dl></dl></div></div>'+
     '<div class="lm-box" style="display:flex;gap:12px;align-items:center;justify-content:space-between"><span style="font-size:.9rem">Save this listing to compare later.</span><button type="button" class="lm-save" style="position:static;border:1px solid var(--line)" data-lm-save="'+p.id+'" aria-pressed="false">'+ICO(I.heart)+'</button></div></aside></div>';
    var ims=$$(".lm-stage img",pd),th=$$(".lm-thumbs button",pd),gc=$(".lm-gcount",pd),cur=0;
    var go=function(n){cur=(n+ims.length)%ims.length;ims.forEach(function(x,i){x.classList.toggle("is-on",i===cur)});th.forEach(function(t,i){t.setAttribute("aria-pressed",i===cur?"true":"false")});gc.textContent=(cur+1)+" / "+ims.length};
    $(".lm-gprev",pd).addEventListener("click",function(){go(cur-1)});$(".lm-gnext",pd).addEventListener("click",function(){go(cur+1)});
    th.forEach(function(t,i){t.addEventListener("click",function(){go(i)})});
    $(".lm-stage",pd).setAttribute("tabindex","0");$(".lm-stage",pd).addEventListener("keydown",function(e){if(e.key==="ArrowLeft")go(cur-1);if(e.key==="ArrowRight")go(cur+1)});
    var tx=null;$(".lm-stage",pd).addEventListener("touchstart",function(e){tx=e.touches[0].clientX},{passive:true});$(".lm-stage",pd).addEventListener("touchend",function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>40)go(cur+(dx<0?1:-1));tx=null});
    var rel=$("[data-lm-related]");if(rel)rel.setAttribute("data-lm-props",p.related.join(","));
  }
}

/* ---------- Saved page ---------- */
function renderSavedPage(){var sp=$("[data-lm-saved-page]");if(!sp)return;
  if(!saved.length){sp.innerHTML='<div class="lm-empty">'+ICO(I.heart)+'<h2>No saved properties yet</h2><p style="color:var(--muted);max-width:440px;margin:0 auto 22px">Tap the heart on any listing to keep it here while you compare. Saved items stay in this browser.</p><a class="lm-btn lm-btn-navy" href="'+link("properties")+'">Browse Properties</a></div>';return}
  sp.innerHTML='<div class="lm-bar"><p><b>'+saved.length+'</b> saved '+(saved.length===1?"property":"properties")+' · stored in this browser</p><button type="button" class="lm-txt" data-lm-clear>Clear all</button></div><div class="lm-grid lm-grid-3">'+saved.map(function(id){return card(BY[id])}).join("")+'</div>';
  $("[data-lm-clear]",sp).addEventListener("click",function(){saved=[];persist();syncSaved()});
  $$("[data-lm-save]",sp).forEach(function(b){b.setAttribute("aria-pressed","true")})}

/* ---------- Forms (validation + confirmation) ---------- */
function msgFor(el){if(el.type==="hidden")return "";var v=el.type==="checkbox"?el.checked:el.value.trim(),lab=el.getAttribute("data-label")||"This field";
  if(el.required&&!v)return el.type==="checkbox"?"Please confirm to continue.":lab+" is required.";if(!v)return "";
  if(el.type==="email"&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return "Enter a valid email address.";
  if(el.type==="tel"&&!/^[+()\d\s.-]{7,20}$/.test(v))return "Enter a valid phone number.";
  if(el.minLength>0&&v.length<el.minLength)return lab+" should be at least "+el.minLength+" characters.";return ""}
function check(el){var f=el.closest(".lm-f");var m=msgFor(el);if(!f)return !m;var er=$(".lm-err",f);f.classList.toggle("bad",!!m);f.classList.toggle("ok",!m&&(el.type==="checkbox"?el.checked:!!el.value.trim()));el.setAttribute("aria-invalid",m?"true":"false");if(er)er.textContent=m;return !m}
root.addEventListener("submit",function(e){var form=e.target.closest("form[data-lm-form]");if(!form)return;e.preventDefault();
  var els=$$("input,select,textarea",form),ok=true,first=null;els.forEach(function(el){if(!check(el)){ok=false;first=first||el}});if(!ok){first.focus();return}
  var done=$(form.getAttribute("data-done")),dl=done&&$("dl",done);
  if(dl){dl.innerHTML="";$$("[data-sum]",form).forEach(function(el){var v=el.tagName==="SELECT"?el.options[el.selectedIndex].text:el.value.trim();if(v)dl.insertAdjacentHTML("beforeend","<dt>"+esc(el.getAttribute("data-label"))+"</dt><dd>"+esc(v)+"</dd>")})}
  form.hidden=true;if(done){done.classList.add("is-on");done.setAttribute("tabindex","-1");done.focus()}
  /* GHL HOOK: replace with a native GHL form/workflow submission. Until connected, submissions are not transmitted. */
});
root.addEventListener("focusout",function(e){var el=e.target;if(el.closest&&el.closest("form[data-lm-form]")&&el.matches("input,select,textarea"))check(el)});
root.addEventListener("input",function(e){var el=e.target;if(el.closest&&el.closest(".lm-f.bad"))check(el)});
root.addEventListener("change",function(e){var el=e.target;if(el.closest&&el.closest("form[data-lm-form]")&&(el.tagName==="SELECT"||el.type==="checkbox"))check(el)});

/* Prefill contact property select from ?property= */
var cp=$("#c-property"),pq=new URLSearchParams(location.search).get("property");if(cp&&pq&&BY[pq])cp.value=pq;

$$("[data-lm-year]").forEach(function(e){e.textContent=new Date().getFullYear()});
fill();
})();

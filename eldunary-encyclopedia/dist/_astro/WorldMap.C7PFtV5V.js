import{_ as u}from"./preload-helper.CLcXU_4U.js";import{j as d}from"./jsx-runtime.TBa3i5EZ.js";import{r as i}from"./index.CVf8TyFT.js";/* empty css                     */function y({markers:l}){const r=i.useRef(null),n=i.useRef(!1);return i.useEffect(()=>{n.current||!r.current||(n.current=!0,u(()=>import("./leaflet-src.DoEXxWUO.js").then(o=>o.l),[]).then(o=>{const t=o.map(r.current,{crs:o.CRS.Simple,minZoom:-2,maxZoom:4,zoomControl:!0,attributionControl:!1}),a=[[0,0],[1e3,1e3]];t.fitBounds(a);const s=o.imageOverlay("/map-bg.svg",a,{errorOverlayUrl:""});s.addTo(t),s.on("error",()=>{});const m={city:"cities",kingdom:"kingdoms",character:"characters"};for(const e of l){const p=m[e.type]??e.type,f=o.divIcon({html:`<div style="
            background:${e.accentColor??"#C49B5C"};
            width:12px;height:12px;border-radius:50%;
            border:2px solid rgba(255,255,255,0.5);
            box-shadow:0 0 6px ${e.accentColor??"#C49B5C"};
          "></div>`,className:"",iconSize:[12,12],iconAnchor:[6,6]}),c=o.marker([e.y,e.x],{icon:f});c.bindPopup(`
          <div style="font-family:Cinzel,serif;color:#F5F0E8;background:#13131A;padding:8px;">
            <div style="font-size:0.6rem;color:${e.accentColor??"#C49B5C"};text-transform:uppercase;margin-bottom:4px">${e.type}</div>
            <div style="font-size:0.9rem;font-weight:700">${e.name}</div>
            <a href="/${p}/${e.slug}" style="color:${e.accentColor??"#C49B5C"};font-size:0.75rem;">View →</a>
          </div>
        `),c.addTo(t)}}))},[]),d.jsx("div",{style:{width:"100%",height:"100%",minHeight:"600px",borderRadius:"8px",overflow:"hidden"},children:d.jsx("div",{ref:r,style:{width:"100%",height:"100%",minHeight:"600px",background:"#0A0A0F"}})})}export{y as default};

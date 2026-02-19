import{j as e}from"./jsx-runtime.TBa3i5EZ.js";import{r as s}from"./index.CVf8TyFT.js";function u(){const n=s.useRef(null);return s.useEffect(()=>{if(!n.current)return;const i=n.current,o=[],c=20;for(let t=0;t<c;t++){const r=document.createElement("div"),a=Math.random()*3+1,d=Math.random()*20+15,l=Math.random()*10,p=Math.random()*100;r.style.cssText=`
        position:absolute;
        width:${a}px;height:${a}px;
        border-radius:50%;
        background:rgba(196,155,92,${Math.random()*.3+.05});
        left:${p}%;
        bottom:-10px;
        animation:float-up ${d}s ${l}s infinite linear;
        pointer-events:none;
      `,i.appendChild(r),o.push(r)}return()=>{o.forEach(t=>t.remove())}},[]),e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @keyframes float-up {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(${Math.random()*40-20}px); opacity: 0; }
        }
      `}),e.jsx("div",{ref:n,style:{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"},"aria-hidden":"true"})]})}export{u as default};

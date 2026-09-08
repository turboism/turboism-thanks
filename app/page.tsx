'use client';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { BrandHeader, BrandFooter, BrandLanguage, type BrandLocale } from '@/brand/shell';
type Point={x:number;y:number};
type Contributor={name:string;profileUrl?:string;x:number;y:number;dx:number;dy:number;duration:number;delay:number};
const text={en:{eyebrow:'A bouquet for you',title:'Thank you.',contributors:'Contributors',profile:'Open profile'},zh:{eyebrow:'献给你的一束花',title:'谢谢。',contributors:'贡献者',profile:'打开个人主页'},ja:{eyebrow:'あなたへ贈る花束',title:'ありがとう。',contributors:'コントリビューター',profile:'プロフィールを開く'}};
function FloatingContributor({contributor,profile}:{contributor:Contributor;profile:string}){
 const ref=useRef<HTMLAnchorElement>(null);
 const drag=useRef<{id:number;x:number;y:number;origin:Point}|null>(null);
 const moved=useRef(false);
 const [offset,setOffset]=useState<Point>({x:0,y:0});
 function bound(next:Point){const node=ref.current,field=node?.parentElement;if(!node||!field)return next;const clamp=(n:number,low:number,high:number)=>Math.max(low,Math.min(high,n));return{x:clamp(next.x,18+node.offsetWidth/2-node.offsetLeft,field.clientWidth-18-node.offsetWidth/2-node.offsetLeft),y:clamp(next.y,12+node.offsetHeight/2-node.offsetTop,field.clientHeight-12-node.offsetHeight/2-node.offsetTop)};}
 function start(event:PointerEvent<HTMLAnchorElement>){if(event.button!==0)return;drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,origin:offset};moved.current=false;event.currentTarget.setPointerCapture(event.pointerId);event.currentTarget.dataset.dragging='true';}
 function move(event:PointerEvent<HTMLAnchorElement>){const state=drag.current;if(!state||state.id!==event.pointerId)return;const x=event.clientX-state.x,y=event.clientY-state.y;if(Math.hypot(x,y)>4)moved.current=true;setOffset(bound({x:state.origin.x+x,y:state.origin.y+y}));}
 function end(event:PointerEvent<HTMLAnchorElement>){if(drag.current?.id!==event.pointerId)return;drag.current=null;event.currentTarget.dataset.dragging='false';if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}
 function click(event:MouseEvent<HTMLAnchorElement>){if(moved.current||!contributor.profileUrl)event.preventDefault();moved.current=false;}
 function key(event:KeyboardEvent<HTMLAnchorElement>){const step=event.shiftKey?36:12;const deltas:Record<string,Point>={ArrowLeft:{x:-step,y:0},ArrowRight:{x:step,y:0},ArrowUp:{x:0,y:-step},ArrowDown:{x:0,y:step}};const delta=deltas[event.key];if(!delta)return;event.preventDefault();setOffset(current=>bound({x:current.x+delta.x,y:current.y+delta.y}));}
 const style={'--left':`${contributor.x}%`,'--top':`${contributor.y}%`,'--dx':`${contributor.dx}px`,'--dy':`${contributor.dy}px`,'--duration':`${contributor.duration}s`,'--delay':`${contributor.delay}s`,transform:`translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`} as CSSProperties;
 return <a ref={ref} className="thanks-name" style={style} href={contributor.profileUrl} target={contributor.profileUrl?'_blank':undefined} rel="noopener noreferrer" draggable={false} tabIndex={0} aria-label={contributor.profileUrl?`${contributor.name} — ${profile}`:contributor.name} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onClick={click} onKeyDown={key}><span>{contributor.name}</span></a>;
}
export default function HomePage(){
 const [language,setLanguage]=useState<BrandLocale>('en');
 useEffect(()=>{const stored=document.cookie.split('; ').find(value=>value.startsWith('turboism-language='))?.split('=')[1];if(stored==='en'||stored==='zh'||stored==='ja'){const timer=setTimeout(()=>setLanguage(stored),0);return()=>clearTimeout(timer);}},[]);
 const [contributors,setContributors]=useState<Contributor[]>([]);
 useEffect(()=>{const controller=new AbortController();async function load(){try{const response=await fetch('/thanks/contributors.json',{cache:'no-store',signal:controller.signal});if(!response.ok)return;const records:unknown=await response.json();if(!Array.isArray(records))return;const random=(min:number,max:number)=>min+Math.random()*(max-min);const list:Contributor[]=[];for(const record of records){if(!record||typeof record!=='object'||typeof record.name!=='string'||(record.profileUrl!==undefined&&typeof record.profileUrl!=='string'))continue;list.push({name:record.name,profileUrl:record.profileUrl,x:random(15,85),y:random(10,86),dx:random(-20,20),dy:random(-18,18),duration:random(11,20),delay:random(-14,0)});}setContributors(list);}catch{/* Optional name-list failures do not remove the acknowledgement page. */}}void load();return()=>controller.abort();},[]);
 function changeLanguage(next:BrandLocale){setLanguage(next);const domain=location.hostname==='turboism.dev'||location.hostname.endsWith('.turboism.dev')?'; Domain=.turboism.dev':'';document.cookie=`turboism-language=${next}; Path=/; Max-Age=31536000; SameSite=Lax${domain}${location.protocol==='https:'?'; Secure':''}`;}
 const copy=text[language];
 return <div className="thanks-page"><BrandHeader active="thanks" locale={language} languageControl={<BrandLanguage locale={language} onChange={changeLanguage}/>}/><main className="thanks-scene"><section className="thanks-title" aria-labelledby="thanks-heading"><p>{copy.eyebrow}</p><h1 id="thanks-heading">{copy.title}</h1></section><div className="thanks-field" aria-label={copy.contributors}>{contributors.map(contributor=><FloatingContributor key={contributor.name} contributor={contributor} profile={copy.profile}/>)}</div></main><BrandFooter/></div>;
}

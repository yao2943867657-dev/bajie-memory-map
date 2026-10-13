/* 单张人物素材沿SVG曲线移动，脸不会随路径帧重生成。 */
(()=>{
const map=document.querySelector('.map'), ns='http://www.w3.org/2000/svg';
const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 1000 444.444');svg.setAttribute('preserveAspectRatio','none');svg.classList.add('route-overlay');svg.setAttribute('aria-hidden','true');
const d='M60 350 C90 305 100 295 140 271.111 C220 300 280 180 380 173.333 C450 150 545 215 630 200 C705 195 780 205 870 244.444';
['route-shadow','route-dashes','route-complete'].forEach(c=>{const p=document.createElementNS(ns,'path');p.setAttribute('d',d);p.classList.add(c);svg.append(p)});map.insertBefore(svg,document.getElementById('pins'));
const path=svg.querySelector('.route-dashes'),complete=svg.querySelector('.route-complete'),total=path.getTotalLength();
const group=document.createElement('div');group.className='travelers';group.setAttribute('aria-hidden','true');
group.innerHTML='<div class="traveler monkey"><img src="images/traveler-wukong.png" alt=""><span class="arrival-spark">✦</span></div><div class="traveler pig"><img src="images/traveler-bajie.png" alt=""></div>';map.append(group);
const tool=document.createElement('div');tool.className='map-controls';tool.innerHTML='<p id="travelStatus" role="status">点一站，跟着师兄弟出发</p><button type="button" id="replayRoute">重走一遍</button><button type="button" id="toggleMotion" aria-pressed="false">关闭小动画</button>';document.querySelector('.map-scroll').after(tool);
const status=document.getElementById('travelStatus'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let enabled=!reduce.matches,position=0,frame=null,replaying=false,epoch=0,replayId=0;
const destinations=window.memories.map(m=>{let best=0,error=Infinity;for(let l=0;l<=total;l+=total/1800){const p=path.getPointAtLength(l),e=(p.x-m.x*10)**2+(p.y-m.y*4.44444)**2;if(e<error){error=e;best=l}}return best});
function paint(l){const p=path.getPointAtLength(l);group.style.left=p.x/10+'%';group.style.top=p.y/4.44444+'%';complete.style.strokeDasharray=l+' '+total;position=l}
function settings(){document.getElementById('toggleMotion').textContent=enabled?'关闭小动画':'开启小动画';document.getElementById('toggleMotion').setAttribute('aria-pressed',String(!enabled));map.classList.toggle('motion-off',!enabled)}settings();paint(destinations[0]);
function cancel(){epoch++;replayId++;if(frame!==null)cancelAnimationFrame(frame);frame=null;replaying=false;group.classList.remove('walking','arrived')}
function move(i,onDone){const token=++epoch,from=position,target=destinations[i],delta=target-from;group.classList.remove('arrived');group.classList.toggle('walking',enabled);group.classList.toggle('going-left',delta<0);status.textContent='正在走向'+window.memories[i].name+'…';
if(!enabled||Math.abs(delta)<1){paint(target);arrive();return}
const started=performance.now(),duration=Math.max(1100,Math.min(3700,Math.abs(delta)/total*5400));
function arrive(){group.classList.remove('walking');group.classList.add('arrived');frame=null;status.textContent='到达'+window.memories[i].name+'，翻开这段日记';if(enabled)group.animate?.([{filter:'brightness(1)'},{filter:'brightness(1.08)'},{filter:'brightness(1)'}],{duration:700});if(onDone)onDone()}
function tick(now){if(token!==epoch)return;const t=Math.min(1,(now-started)/duration),smooth=t*t*(3-2*t);paint(from+delta*smooth);if(t<1)frame=requestAnimationFrame(tick);else{paint(target);arrive()}}frame=requestAnimationFrame(tick)}
window.travelTo=i=>{cancel();move(i)};
document.getElementById('toggleMotion').addEventListener('click',()=>{enabled=!enabled;cancel();settings();paint(destinations[window.currentStoryIndex||0]);status.textContent=enabled?'小动画已开启':'小动画已关闭，仍可点击故事'});
document.getElementById('replayRoute').addEventListener('click',()=>{cancel();const run=replayId;replaying=true;paint(0);function next(i){if(!replaying||run!==replayId)return;window.showStory(i,false);move(i,()=>{if(replaying&&run===replayId&&i<destinations.length-1)setTimeout(()=>next(i+1),750);else replaying=false})}next(0)});
reduce.addEventListener?.('change',e=>{if(e.matches){enabled=false;cancel();settings();paint(destinations[window.currentStoryIndex||0])}});
})();

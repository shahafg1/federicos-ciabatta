// Small, original procedural foley. No downloads or audio permissions required.
export function createSound(){
 let context,master,noiseBuffer,enabled=false;
 function init(){
  if(context)return;
  const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
  context=new Audio();master=context.createGain();master.gain.value=.55;master.connect(context.destination);
  noiseBuffer=context.createBuffer(1,context.sampleRate,context.sampleRate);
  const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
 }
 function note(freq,duration,volume,delay=0,end=freq,type='sine'){
  const t=context.currentTime+delay,source=context.createOscillator(),gain=context.createGain();source.type=type;source.frequency.setValueAtTime(freq,t);source.frequency.exponentialRampToValueAtTime(end,t+duration);source.connect(gain);gain.connect(master);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);source.start(t);source.stop(t+duration+.01);source.onended=()=>{source.disconnect();gain.disconnect();};
 }
 function rustle(duration,volume,freq,delay=0,type='lowpass'){
  const t=context.currentTime+delay,source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=noiseBuffer;filter.type=type;filter.frequency.value=freq;source.connect(filter);filter.connect(gain);gain.connect(master);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.012);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);source.start(t);source.stop(t+duration);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
 }
 return {
  setEnabled(value){try{if(value){init();context.resume().catch(()=>{});}enabled=!!value;if(master){master.gain.cancelScheduledValues(context.currentTime);master.gain.setValueAtTime(enabled?.55:0,context.currentTime);}return enabled;}catch{enabled=false;return false;}},
  play(kind){if(!enabled||!context||context.state!=='running')return;try{
   switch(kind){
    case 'pesto':case 'pumpkin':rustle(.22,.22,kind==='pesto'?750:450);note(145,.14,.10,0,75);break;
    case 'tomato':note(280,.12,.18,0,90);rustle(.055,.10,1200);break;
    case 'pepperoni':rustle(.065,.18,1800);note(175,.075,.10,0,95);break;
    case 'stracciatella':rustle(.17,.19,550);note(210,.10,.08,0,95);break;
    case 'taleggio':note(130,.11,.20,0,75);rustle(.04,.10,850);break;
    case 'bread':rustle(.20,.18,1800);note(110,.11,.10,0,70);break;
    case 'undo':rustle(.10,.10,1100);break;
    case 'refill-start':note(125,.13,.18,0,80);rustle(.28,.16,1400,.06);note(160,.10,.11,.15,90);break;
    case 'refill-done':rustle(.24,.17,1700);[510,790,1060].forEach((f,i)=>note(f,.14,.07,i*.07,f*.96,'triangle'));break;
    case 'kombucha':note(680,.085,.18,0,170);rustle(.55,.12,3800,.04,'highpass');[620,840,710,980].forEach((f,i)=>note(f,.045,.04,.1+i*.07,f*1.2));break;
    case 'serve':[523,659,784].forEach((f,i)=>note(f,.16,.09,i*.10));break;
    default:note(440,.08,.06);
   }
  }catch{/* Audio failure never interrupts gameplay. */}}
 };
}

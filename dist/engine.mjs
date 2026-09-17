import {customerForOrder} from './customers.mjs?v=4';
export const FOODS=[{id:'pesto',name:'פסטו'},{id:'tomato',name:'עגבניות'},{id:'pepperoni',name:'פפרוני'},{id:'stracciatella',name:'סטרצ׳אטלה'},{id:'taleggio',name:'טלג׳יו'},{id:'pumpkin',name:'קרם דלעת מותסס'}];
const RECIPES=[[1,2,0,0,1,0],[0,1,2,1,0,0],[1,1,0,2,0,1],[0,2,1,0,2,1],[1,1,1,1,1,1],[2,0,2,0,1,1]];
export const STOCK_CAPACITY=8;
export function recipeForOrder(order){const base=[...RECIPES[(order-1)%6]];const level=Math.min(3,Math.floor((order-1)/6));for(let n=0;n<level;n++){base[(order+n*2)%6]++;base[(order+n*2+1)%6]++;}return base;}
const orderKeys=['order','recipe','meal','breadTaken','duration','remaining','treat'];
function newOrder(order){const duration=order===1?Infinity:Math.max(45,80-order*2)+Math.min(3,Math.floor((order-1)/6))*4;return {order,recipe:recipeForOrder(order),meal:[],breadTaken:false,duration,remaining:duration,treat:false};}
function currentOrder(state){return Object.fromEntries(orderKeys.map(k=>[k,state[k]]));}
export function switchCustomer(state){if(state.phase!=='playing'||!state.waiting)return false;const previous=currentOrder(state);Object.assign(state,state.waiting);state.waiting=previous;return true;}
export function canTreat(state){return state.phase==='playing'&&Number.isFinite(state.duration)&&state.remaining>=state.duration/2&&state.breadTaken&&matches(state)&&!state.treat;}
export function offerTreat(state){if(!canTreat(state))return false;state.treat=true;return true;}

export function requestRefill(state){if(state.phase!=='playing'||state.refillRemaining>0||state.stock.every(n=>n===STOCK_CAPACITY))return false;state.refillDuration=Math.min(6,4+Math.floor((state.order-1)/6));state.refillRemaining=state.refillDuration;return true;}
export function createState(){return {phase:'intro',stock:FOODS.map(()=>STOCK_CAPACITY),refillRemaining:0,refillDuration:4,meal:[],breadTaken:false,recipe:[...RECIPES[0]],order:1,score:0,served:0,remaining:Infinity,duration:Infinity,dialog:null,waiting:null,lastOrder:1,treat:false,lastTreatBonus:0};}
export function counts(state){return FOODS.map((_,i)=>state.meal.filter(x=>x===i).length);}
export function matches(state){return counts(state).every((n,i)=>n===state.recipe[i]);}
export function takeBread(state){if(state.phase!=='playing'||state.breadTaken)return false;state.breadTaken=true;return true;}
export function add(state,index){if(state.phase!=='playing'||!state.breadTaken)return false;if(!Number.isInteger(index)||index<0||index>=FOODS.length)throw new Error('Unknown ingredient');if(state.meal.length>=18||state.stock[index]===0)return false;state.stock[index]--;state.meal.push(index);return true;}
export function undo(state){if(state.phase!=='playing'||!state.meal.length)return null;const i=state.meal.pop();state.stock[i]=Math.min(STOCK_CAPACITY,state.stock[i]+1);return i;}
export function serve(state){if(state.phase!=='playing'||!state.breadTaken||!matches(state))return null;const bonus=Number.isFinite(state.duration)?Math.ceil(15*state.remaining/state.duration):0;state.lastTreatBonus=state.treat&&state.remaining>=state.duration/2?20:0;const reward=25+bonus+state.lastTreatBonus;state.score+=reward;state.served++;state.phase='serving';return reward;}
export function next(state){if(state.phase!=='serving')return false;if(state.waiting){Object.assign(state,state.waiting);state.waiting=null;}else Object.assign(state,newOrder(++state.lastOrder));if(state.lastOrder>=4){let upcoming=++state.lastOrder;while(customerForOrder(upcoming).id===customerForOrder(state.order).id)upcoming=++state.lastOrder;state.waiting=newOrder(upcoming);}state.phase='playing';return true;}
export function tick(state,seconds){if(state.phase!=='playing')return;const elapsed=Math.max(0,seconds);if(state.refillRemaining>0){state.refillRemaining=Math.max(0,state.refillRemaining-elapsed);if(state.refillRemaining===0)state.stock.fill(STOCK_CAPACITY);}if(state.waiting){state.waiting.remaining=Math.max(0,state.waiting.remaining-elapsed);if(state.waiting.remaining===0)state.phase='over';}if(!Number.isFinite(state.remaining))return;state.remaining=Math.max(0,state.remaining-Math.max(0,seconds));if(state.remaining===0)state.phase='over';}

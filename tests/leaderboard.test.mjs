import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeName,validName,rpc} from '../dist/leaderboard.mjs';
test('player names preserve Hebrew and reject markup and direction overrides',()=>{
 assert.equal(normalizeName('  אורי   המלך  '),'אורי המלך');
 assert.ok(validName('אורי המלך'));
 for(const name of ['', 'a'.repeat(25),'<script>','name\u202Eabc','a\u0000b']) assert.equal(validName(name),false);
});
test('RPC propagates server rejection rather than reporting a successful save',async()=>{
 const original=globalThis.fetch;
 try {
  globalThis.fetch=async()=>({ok:false,json:async()=>({message:'INVALID_SCORE'})});
  await assert.rejects(rpc('submit_score',{}),/INVALID_SCORE/);
 } finally {globalThis.fetch=original;}
});

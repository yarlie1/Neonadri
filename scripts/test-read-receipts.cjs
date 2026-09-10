const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("../node_modules/typescript");

function harness({ visible = true, focus = true, rectTop = 100, fail = false, stored = [] } = {}) {
  const effects = [], states = [], calls = [], timeouts = [], intervals = [], events = {};
  const document = { visibilityState: visible ? "visible" : "hidden", hasFocus: () => focus,
    addEventListener: (n,f) => events[n]=f, removeEventListener() {} };
  const window = { innerHeight: 800, innerWidth: 1000,
    addEventListener: (n,f) => events[n]=f, removeEventListener() {} };
  const incoming = "17700000000000001", outgoing = "17700000000000002";
  const node = { dataset: { receiptId: incoming }, getBoundingClientRect: () =>
    ({ top:rectTop, bottom:rectTop+80, left:20, right:300, height:80 }) };
  const list = { getBoundingClientRect: () => ({ top:50,bottom:600,left:0,right:500 }),
    querySelectorAll: () => [node], addEventListener: (n,f) => events[n]=f, removeEventListener() {} };
  let stateIndex=0;
  const exports = {};
  const context = { exports, document, window, AbortController, Set, Array,
    setTimeout: f => (timeouts.push(f),timeouts.length), clearTimeout() {},
    setInterval: f => (intervals.push(f),intervals.length), clearInterval() {},
    fetch: async (_url, options) => { calls.push(JSON.parse(options.body));
      return { ok: !fail, json: async () => ({ readMessageIds: stored }) }; },
    require: () => ({
      useEffect: f => effects.push(f),
      useRef: value => ({ current:value }),
      useState: value => { const i=stateIndex++; states[i]=value; return [value, next => {
        states[i] = typeof next==="function" ? next(states[i]) : next;
      }]; }
    })
  };
  const source=fs.readFileSync("app/matches/[matchId]/useReadReceipts.ts","utf8");
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);
  exports.useReadReceipts(35,"me",[
    {id:incoming,senderId:"them",readReceiptVersion:1},
    {id:outgoing,senderId:"me",readReceiptVersion:1},
    {id:"17700000000000003",senderId:"me"} // legacy
  ], {current:list},true);
  effects.forEach(f=>f());
  return {calls,states,timeouts,intervals,document,events,incoming,outgoing};
}
const settle = () => new Promise(resolve=>setImmediate(resolve));
(async()=>{
 let h=harness(); h.timeouts.at(-1)(); await settle();
 assert.deepEqual(h.calls[0].readMessageIds,[h.incoming]);
 assert.deepEqual(h.calls[0].sentMessageIds,[h.outgoing]);
 assert(h.states[1].has(h.outgoing)); assert(!h.states[0].has(h.outgoing));
 h.intervals[0](); await settle(); assert.equal(h.calls[1].readMessageIds.length,0);

 h=harness({visible:false}); h.timeouts.at(-1)(); await settle(); assert.equal(h.calls.length,0);
 h=harness({focus:false}); h.timeouts.at(-1)(); await settle(); assert.equal(h.calls[0].readMessageIds.length,0);
 h=harness({rectTop:700}); h.timeouts.at(-1)(); await settle(); assert.equal(h.calls[0].readMessageIds.length,0);
 h=harness({fail:true}); h.timeouts.at(-1)(); await settle(); h.intervals[0](); await settle();
 assert.equal(h.calls[1].readMessageIds.length,1); assert.equal(h.states[0].size,0);
 h=harness({stored:["17700000000000002"]}); h.timeouts.at(-1)(); await settle();
 assert(h.states[0].has(h.outgoing)); // persisted read receipt after remount
 console.log("PASS: visible reads, hidden/unfocused/offscreen protection, legacy exclusion, retry, persisted reads");
})().catch(error=>{ console.error(error); process.exitCode=1; });

const fs=require('fs'), vm=require('vm');
const UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const nav={userAgent:UA, language:'en-US', languages:['en-US','en'], platform:'Linux x86_64', hardwareConcurrency:4};
const ctx={navigator:nav, console, Date, Math, TextEncoder, crypto:require('crypto').webcrypto, screen:{width:1920,height:1080,colorDepth:24}, location:{href:'https://gofile.io/d/x',hostname:'gofile.io'}, document:{}, Intl};
ctx.window=ctx; ctx.self=ctx; ctx.globalThis=ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('wt.obf.js','utf8'), ctx);
(async()=>{ const wt=await ctx.generateWT(process.argv[2]); console.log(wt); console.log(UA);})().catch(e=>{console.error('ERR',e.message);process.exit(1)});

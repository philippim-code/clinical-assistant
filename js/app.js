/* Miracle-Ear Clinical Assistant development loader — Sycle embed test */
(function(){
  const SYCLE_URL='https://www.mymiracle-ear.com/freecvs/schedule_hm.php';

  function applyLayoutFixes(){
    const old=document.getElementById('development-layout-fixes');
    if(old) old.remove();
    const style=document.createElement('style');
    style.id='development-layout-fixes';
    style.textContent=`
      /* Keep About cards consistently separated. */
      #aboutData + .about-grid{margin-top:24px;}

      /* Development test: keep Open Sycle + Help visible on portrait phones.
         This intentionally overrides the older mobile rule that hid .appbar-actions. */
      @media(max-width:600px){
        .appbar-actions{display:flex!important;width:100%!important;gap:8px!important;flex-wrap:nowrap!important;}
        .appbar-actions button{display:block!important;flex:1 1 0!important;margin:0!important;min-width:0!important;min-height:44px!important;}
      }

      /* Temporary in-app Sycle viewer used only on development. */
      .sycle-test-overlay{position:fixed;inset:0;z-index:5000;background:var(--surface,#fff);display:flex;flex-direction:column;}
      .sycle-test-overlay.hidden{display:none;}
      .sycle-test-bar{display:flex;align-items:center;gap:8px;padding:10px;background:var(--surface,#fff);border-bottom:1px solid var(--line-theme,var(--border));padding-top:max(10px,env(safe-area-inset-top));}
      .sycle-test-bar button{margin:0;box-shadow:none;white-space:nowrap;}
      .sycle-test-title{font-weight:bold;color:var(--accent,var(--teal));flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
      .sycle-test-frame{width:100%;height:100%;border:0;flex:1;background:#fff;}
      @media(max-width:520px){.sycle-test-title{display:none}.sycle-test-bar button{padding:10px 11px;font-size:13px;}}
    `;
    document.head.appendChild(style);
  }

  function ensureSycleViewer(){
    let overlay=document.getElementById('sycleTestOverlay');
    if(overlay) return overlay;
    overlay=document.createElement('div');
    overlay.id='sycleTestOverlay';
    overlay.className='sycle-test-overlay hidden';
    overlay.innerHTML=`
      <div class="sycle-test-bar">
        <button type="button" class="secondary" id="sycleTestClose">← Clinical Assistant</button>
        <div class="sycle-test-title">Sycle — in-app embed test</div>
        <button type="button" class="secondary" id="sycleTestRefresh">Refresh</button>
        <button type="button" class="secondary" id="sycleTestExternal">External ↗</button>
      </div>
      <iframe class="sycle-test-frame" id="sycleTestFrame" title="Sycle embed test" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    document.body.appendChild(overlay);
    document.getElementById('sycleTestClose').onclick=()=>{
      overlay.classList.add('hidden');
      document.body.style.overflow='';
    };
    document.getElementById('sycleTestRefresh').onclick=()=>{
      const frame=document.getElementById('sycleTestFrame');
      frame.src=SYCLE_URL;
    };
    document.getElementById('sycleTestExternal').onclick=()=>window.open(SYCLE_URL,'_blank','noopener,noreferrer');
    return overlay;
  }

  function installSycleEmbedTest(){
    const button=document.querySelector('.sycle-shortcut');
    if(button) button.textContent='Open Sycle TEST';
    window.openSycle=function(){
      const overlay=ensureSycleViewer();
      const frame=document.getElementById('sycleTestFrame');
      frame.src=SYCLE_URL;
      overlay.classList.remove('hidden');
      document.body.style.overflow='hidden';
    };
  }

  function ready(){
    applyLayoutFixes();
    installSycleEmbedTest();
  }

  function loadSequentially(){
    const core=document.createElement('script');
    core.src='js/app-core.js';
    core.async=false;
    core.onload=function(){
      const smart=document.createElement('script');
      smart.src='js/smart-notes.js';
      smart.async=false;
      smart.onload=ready;
      document.body.appendChild(smart);
    };
    document.body.appendChild(core);
  }

  applyLayoutFixes();

  if(document.readyState==='loading'){
    document.write('<script src="js/app-core.js"><\/script><script src="js/smart-notes.js"><\/script>');
    document.addEventListener('DOMContentLoaded',installSycleEmbedTest,{once:true});
  }else{
    loadSequentially();
  }
})();
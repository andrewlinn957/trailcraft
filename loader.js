(async()=>{
  const files=['src2-01.js','src2-02.js','src2-03.js','src2-04.js','src2-05.js','src2-06.js','src2-07.js','src2-08.js'];
  const parts=await Promise.all(files.map(async file=>{
    const response=await fetch(file,{cache:'no-cache'});
    if(!response.ok) throw new Error(`Could not load ${file}`);
    return response.text();
  }));
  (0,eval)(parts.join(''));
})().catch(error=>{
  const root=document.getElementById('root');
  root.innerHTML=`<main style="max-width:700px;margin:4rem auto;padding:2rem;font-family:system-ui;color:#173f37"><h1>Trailcraft could not start</h1><p>${String(error.message||error)}</p><p>Reload the page or use a current browser.</p></main>`;
  console.error(error);
});

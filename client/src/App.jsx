import { useState } from 'react';
import { BrainCircuit, BriefcaseBusiness, FileUp, Target, CheckCircle2, AlertCircle, LoaderCircle, Sparkles, Download, Search, ExternalLink, FilePenLine } from 'lucide-react';

async function api(path, form, signal) {
  const response = await fetch(path, { method: 'POST', body: form, signal });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
export default function App() {
  const [page, setPage] = useState('matching');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('junior software developer');
  const [result, setResult] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState(null);
  const [tailored, setTailored] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  function cvForm() {
    if (!file) throw new Error('Select your PDF CV in the Your CV section before searching or tailoring jobs.');
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) throw new Error('Please choose a PDF file (.pdf).');
    if (file.size > 5 * 1024 * 1024) throw new Error('PDF must be 5 MB or smaller.');
    const form = new FormData(); form.append('cv', file, file.name); return form;
  }
  async function run(action, fn) {
    setError(''); setBusy(action);
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 90000);
    try { await fn(controller.signal); } catch (e) { setError(e.name === 'AbortError' ? 'Request timed out. Please retry.' : e.message); } finally { clearTimeout(timeout); setBusy(''); }
  }
  function analyze(e) {
    e.preventDefault(); run('analyze', async signal => { const form = cvForm(); form.append('jobDescription', description); const data = await api('/api/analyze', form, signal); setResult(data); });
  }
  function searchJobs(e) {
    e.preventDefault(); run('search', async signal => { const form = cvForm(); form.append('query', query); const data = await api('/api/jobs/search', form, signal); setJobs(data.jobs); setNotice(data.notice); setSelected(null); setTailored(null); });
  }
  function tailor(job) {
    run('tailor', async signal => { const form = cvForm(); form.append('title', job.title); form.append('company', job.company); form.append('jobDescription', job.description); const data = await api('/api/cv/tailor', form, signal); setSelected(job); setTailored(data.tailored); });
  }
  function changeCv(field, value) { setTailored(current => ({ ...current, [field]: value })); }
  function changeSection(index, field, value) { setTailored(current => ({ ...current, sections: current.sections.map((section, i) => i === index ? { ...section, [field]: value } : section) })); }
  async function download(format) {
    await run('download', async signal => {
      if (!tailored) throw new Error('Tailor your CV first.');
      const response = await fetch('/api/cv/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tailored, format }), signal });
      if (!response.ok) { const d = await response.json().catch(() => ({})); throw new Error(d.error || 'Download failed'); }
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `tailored-cv.${format}`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  return <div className="shell"><aside className="sidebar"><div className="brand"><span className="brand-icon"><BrainCircuit size={24}/></span><span>Career<span className="accent">Navigator</span><small>AI-powered career intelligence</small></span></div><div className="nav-title">WORKSPACE</div><button className={'nav '+(page==='matching'?'active':'')} onClick={()=>setPage('matching')}><BriefcaseBusiness size={18}/> AI job matching</button><button className={'nav '+(page==='analysis'?'active':'')} onClick={()=>setPage('analysis')}><Target size={18}/> Career analysis</button><div className="sidebar-bottom">Built for your next opportunity <Sparkles size={16}/></div></aside>
    <main><header><div><div className="eyebrow">YOUR CAREER, DECODED</div><h1>Find your next <span className="gradient">career move.</span></h1><p className="subtitle">Find real remote job listings, compare them to your CV, and tailor a truthful, editable CV for each role.</p></div><div className="header-icon"><BrainCircuit size={32}/></div></header>
      <section className="panel"><div className="panel-heading"><div><h2>Your CV</h2><p>Upload a text-based PDF. Your file is processed in memory and is not saved by this application.</p></div><span className="chip">GROQ AI</span></div><label className={'upload compact '+(file?'uploaded':'')} htmlFor="cv"><input id="cv" type="file" accept=".pdf,application/pdf" onChange={e=>{setFile(e.target.files?.[0]||null);setError('');setJobs([]);setTailored(null);setResult(null);}}/>{file?<CheckCircle2/>:<FileUp/>}<strong>{file?file.name:'Select PDF CV (max 5 MB)'}</strong></label><p className="disclaimer">{file ? `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB). This CV will be sent with each job search and tailoring request.` : 'Step 1: Choose a PDF CV here. Step 2: Click Find matching jobs.'}</p></section>
      {error&&<div className="error"><AlertCircle size={18}/>{error}</div>}
      {page==='matching'&&<><section className="panel spaced"><div className="panel-heading"><div><h2>Discover matching jobs</h2><p>Search live remote listings from Remotive, then let Groq rank them against your CV.</p></div></div><form onSubmit={searchJobs} className="search-line"><input aria-label="Job search keywords" value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. frontend developer" maxLength={100}/><button disabled={!!busy || !file} title={!file ? 'Upload your PDF CV first' : 'Find matching jobs'} type="submit">{busy==='search'?<LoaderCircle className="spin"/>:<Search size={17}/>} Find matching jobs</button></form><p className="disclaimer">Live listings only; results may be limited by search keywords, remote eligibility and provider availability. Scores are AI estimates of skills alignment, not hiring predictions.</p></section>
        {!!notice&&<p className="notice">{notice}</p>}
        {jobs.length>0&&<section className="results"><h2>Jobs aligned with your CV ({jobs.length})</h2><div className="jobs-grid">{jobs.map(job=><article className="job-card" key={job.id}><div className="job-head"><div><h3>{job.title}</h3><p>{job.company} · {job.location}</p></div><span className="match-pill">{job.score===null?'—':`${job.score}%`} match</span></div><p>{job.reason}</p>{job.gaps?.length>0&&<p className="disclaimer">Not evidenced: {job.gaps.join(', ')}</p>}<div className="job-actions"><a href={job.url} target="_blank" rel="noopener noreferrer">View real listing <ExternalLink size={14}/></a><button disabled={!!busy} onClick={()=>tailor(job)}><FilePenLine size={15}/> Tailor my CV</button></div></article>)}</div></section>}
        {selected&&tailored&&<section className="results"><div className="panel-heading"><div><h2>Tailored CV: {selected.title}</h2><p>{selected.company} · Review and edit every claim before using this CV.</p></div></div><div className="warning"><AlertCircle size={18}/> AI can make mistakes. Check names, dates, education, achievements and all claims against your original CV. Only submit a verified version.</div><div className="cv-form"><label>Full name<input value={tailored.name} onChange={e=>changeCv('name',e.target.value)}/></label><label>Contact details <small>One per line</small><textarea rows="3" value={tailored.contact.join('\n')} onChange={e=>changeCv('contact',e.target.value.split('\n'))}/></label><label>Professional summary<textarea rows="4" value={tailored.summary} onChange={e=>changeCv('summary',e.target.value)}/></label>{tailored.sections.map((section,i)=><div className="cv-section" key={i}><label>Section heading<input value={section.heading} onChange={e=>changeSection(i,'heading',e.target.value)}/></label><label>Experience and achievements <small>One bullet per line</small><textarea rows="5" value={section.items.join('\n')} onChange={e=>changeSection(i,'items',e.target.value.split('\n'))}/></label></div>)}</div><div className="download-actions"><button disabled={!!busy} onClick={()=>download('docx')}><Download size={17}/> Download Word (.docx)</button><button disabled={!!busy} onClick={()=>download('pdf')}><Download size={17}/> Download PDF</button></div><p className="disclaimer">Both formats are generated from the same edited content. No automated system can guarantee a mistake-free CV without your review.</p></section>}
      </>}
      {page==='analysis'&&<><section className="panel spaced"><h2>Analyze a specific job description</h2><p className="subtitle">Paste a job description to compare its requirements with your CV.</p><form onSubmit={analyze}><textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Paste a job description (at least 50 characters)…"/><div className="form-footer"><span>Skill coverage, not a hiring prediction</span><button disabled={!!busy} type="submit">{busy==='analyze'?<LoaderCircle className="spin"/>:<Target size={17}/>} Analyze my CV</button></div></form></section>{result&&<section className="results"><div className="result-head"><h2>Career analysis</h2><div className="score"><strong>{result.matchScore}%</strong><span>Skills coverage</span></div></div><div className="result-grid"><article><h3>Matched skills</h3><ul>{result.matchedSkills.map((s,i)=><li key={i}><CheckCircle2 size={15}/>{s}</li>)}</ul></article><article><h3>Not evidenced in CV</h3><ul>{result.missingSkills.map((s,i)=><li key={i}><Target size={15}/>{s}</li>)}</ul></article><article className="wide"><h3>Summary</h3><p>{result.summary}</p></article><article className="wide"><h3>CV improvement tips</h3><ul>{result.cvTips.map((s,i)=><li key={i}>{s}</li>)}</ul></article></div></section>}</>}
      <footer>AI Career Navigator · React · Express · Groq · Remotive</footer>
    </main></div>;
}

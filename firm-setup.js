/* Firm setup is a local, resumable prototype flow. Invitations never send email. */
window.createFirmSetup = function({state,bills,stateDirectory,escapeHtml:esc,initials,render,showToast}) {
  const key="domeFirmSetupV1", steps=["Your firm","Clients","Issues & themes","Coverage","Team","Review"];
  const fresh=()=>({step:0,furthest:0,started:false,firm:"",name:"",office:"",clients:[],issues:[],allStates:true,states:[],invites:[],reviewer:"",completed:false,fields:{}});
  let draft=fresh(), storageOK=true, saved=null;
  try { saved=JSON.parse(localStorage.getItem(key)||"null"); if(saved?.version===1)draft={...fresh(),...saved.draft}; } catch { storageOK=false; }
  const templates=state.issues.map(x=>({name:x.name,description:x.description,themes:[...x.themes]}));
  function apply(records){
    if(!records)return;
    for(const [collection,items] of Object.entries(records))for(const item of items){const old=state[collection].find(x=>x.id===item.id);if(old)Object.assign(old,item);else state[collection].push(item);}
    state.firmProfile={name:draft.firm,office:draft.office,administrator:draft.name,states:draft.allStates?stateDirectory.map(x=>x[0]):draft.states,invitationDrafts:draft.invites};
  }
  apply(saved?.records);
  function persist(records=saved?.records){try{saved={version:1,draft,records};localStorage.setItem(key,JSON.stringify(saved));storageOK=true;return true;}catch{storageOK=false;showToast("Your browser could not save setup. Keep this tab open and try again.");return false;}}
  const attr=(value)=>esc(value||"");
  const button=(label,action,extra="",primary=false)=>`<button type="button" class="button ${primary?"primary":"secondary"}" data-setup-action="${action}" ${extra}>${label}</button>`;
  const field=(label,name,value,placeholder="",required=false,type="text")=>`<label class="setup-field">${label}${required?" <span aria-hidden='true'>*</span>":""}<input type="${type}" name="${name}" value="${attr(value)}" placeholder="${attr(placeholder)}" ${required?"required":""} maxlength="160"></label>`;
  const chips=(values)=>values.map(x=>`<span class="setup-chip">${esc(x)}</span>`).join("");
  const list=(s)=>[...new Set(s.split(",").map(x=>x.trim()).filter(Boolean))];
  function move(step){draft.step=step;draft.furthest=Math.max(draft.furthest,step);draft.started=true;persist();render();document.querySelector(".setup-content h1")?.focus();window.scrollTo(0,0);}
  function capture(){
    const form=document.querySelector("#firmSetupForm");if(!form)return;
    const values=Object.fromEntries(new FormData(form));
    for(const name of ["clientName","clientIndustry","clientContext","customIssue","inviteEmail","inviteRole"])if(name in values)draft.fields[name]=values[name];
    if(draft.step===0){draft.firm=values.firm?.trim()||"";draft.name=values.name?.trim()||"";draft.office=values.office?.trim()||"";}
    if(draft.step===4)draft.reviewer=values.reviewer||draft.name;
    draft.started=true;persist();
  }
  function stepBody(){
    if(draft.step===0)return `<div class="setup-intro"><span class="setup-kicker">A workspace built around your practice</span><h1 tabindex="-1">Let’s set up your firm.</h1><p>Start with the essentials. You can add clients, refine coverage, and bring in your team as you go.</p></div><div class="setup-fields">${field("Firm name","firm",draft.firm,"e.g. Capitol Lane Public Affairs",true)}${field("Your name","name",draft.name,"First and last name",true)}${field("Primary office · optional","office",draft.office,"e.g. Washington, DC")}</div><div class="setup-note">About 5 minutes · Progress saves in this browser<br>This prototype adds your setup alongside the existing demo workspace. It does not create an account.</div>`;
    if(draft.step===1)return `<div class="setup-intro"><span class="setup-kicker">01 / Know who you represent</span><h1 tabindex="-1">Start with your clients.</h1><p>Add a name and industry now. A little business context will help your team assess relevance later.</p></div><div class="setup-items">${draft.clients.map((c,i)=>`<article class="setup-item"><span class="setup-avatar">${esc(initials(c.name))}</span><div><b>${esc(c.name)}</b><p>${esc(c.industry||"Industry not added")}</p>${c.context?`<small>${esc(c.context)}</small>`:""}</div>${button("Remove","remove-client",`data-index="${i}" aria-label="Remove ${attr(c.name)}"`)}</article>`).join("")}</div><div class="setup-editor"><h2>Add a client</h2><div class="setup-two">${field("Client name","clientName","","Organization name")}${field("Industry","clientIndustry","","e.g. Real estate")}</div><label class="setup-field">Business context · optional<textarea name="clientContext" maxlength="2000" placeholder="Markets, products, key competencies, or priorities"></textarea></label>${button("Add client","add-client")}</div><p class="setup-hint">${draft.clients.length} client${draft.clients.length===1?"":"s"} added. You can skip this step and add clients later.</p>`;
    if(draft.step===2)return `<div class="setup-intro"><span class="setup-kicker">02 / Organize the policy landscape</span><h1 tabindex="-1">What are you watching?</h1><p>Choose issues, narrow them with themes, and connect the clients they matter to. These are starting points you can edit.</p></div><div class="setup-options">${templates.map((t,i)=>`<button type="button" class="setup-option ${draft.issues.some(x=>x.name===t.name)?"selected":""}" data-setup-action="toggle-issue" data-index="${i}" aria-pressed="${draft.issues.some(x=>x.name===t.name)}"><span>${esc(t.name)}</span><span aria-hidden="true">${draft.issues.some(x=>x.name===t.name)?"✓":"+"}</span></button>`).join("")}</div><div class="setup-inline">${field("Or add your own issue","customIssue","","e.g. Transportation")}${button("Add issue","add-issue")}</div>${draft.issues.map((issue,i)=>`<details class="setup-issue" open><summary>${esc(issue.name)} <span>${issue.themes.length} themes</span></summary><div class="setup-issue-body"><label class="setup-field">Themes · separate with commas<input data-setup-issue-field="themes" data-index="${i}" value="${attr(issue.themes.join(", "))}" placeholder="e.g. Tenant protections, Housing supply"></label><fieldset><legend>Associated clients</legend>${draft.clients.length?draft.clients.map(c=>`<label class="setup-check"><input type="checkbox" data-setup-client-link="${i}" value="${attr(c.name)}" ${issue.clients.includes(c.name)?"checked":""}>${esc(c.name)}</label>`).join(""):"<p class='setup-hint'>Add clients in the previous step, or link them later.</p>"}</fieldset><label class="setup-field">Tracked keywords · optional, separate with commas<input data-setup-issue-field="keywords" data-index="${i}" value="${attr(issue.keywords.join(", "))}" placeholder="e.g. algorithmic rent, eviction protection"></label>${!templates.some(t=>t.name===issue.name)?button("Remove issue","remove-issue",`data-index="${i}"`):""}</div></details>`).join("")}`;
    if(draft.step===3)return `<div class="setup-intro"><span class="setup-kicker">03 / Set your reach</span><h1 tabindex="-1">Where do you work?</h1><p>Choose the states that matter to your practice. These preferences are saved with your firm setup.</p></div><div class="setup-options"><label class="setup-option ${draft.allStates?"selected":""}"><input type="radio" name="coverage" value="all" ${draft.allStates?"checked":""}>All 50 states <span>National coverage</span></label><label class="setup-option ${!draft.allStates?"selected":""}"><input type="radio" name="coverage" value="selected" ${!draft.allStates?"checked":""}>Select states</label></div>${draft.allStates?`<div class="setup-note">All 50 state legislatures are included. You can narrow individual issues and client workspaces later.</div>`:`<div class="setup-state-header"><b>${draft.states.length} states selected</b>${button("Select all","select-states")}${button("Clear","clear-states")}</div><input class="setup-state-search" aria-label="Find a state" placeholder="Find a state" data-setup-state-search><div class="setup-states">${stateDirectory.map(([code,name])=>`<label class="setup-check" data-setup-state-name="${name.toLowerCase()}"><input type="checkbox" data-setup-state="${code}" ${draft.states.includes(code)?"checked":""}>${name}</label>`).join("")}</div>`}<p class="setup-hint">Prototype coverage preferences will be used for the sample suggestions at the end. The existing demo data stays available.</p>`;
    if(draft.step===4)return `<div class="setup-intro"><span class="setup-kicker">04 / Put the right people in the loop</span><h1 tabindex="-1">Bring your team together.</h1><p>Choose an initial client owner and prepare invitations. You can finish setup on your own.</p></div><label class="setup-field">Initial client relationship owner<select name="reviewer">${[...new Set([draft.name,...state.users.map(x=>x.name)])].filter(Boolean).map(name=>`<option ${name===(draft.reviewer||draft.name)?"selected":""}>${esc(name)}</option>`).join("")}</select><small>Assigned to new clients. Existing client owners are preserved.</small></label><div class="setup-editor"><h2>Prepare an invitation</h2><div class="setup-two">${field("Email address","inviteEmail","","colleague@firm.com",false,"email")}<label class="setup-field">Role<select name="inviteRole"><option>Member</option><option>Admin</option><option>Viewer</option></select></label></div><p class="setup-hint">Members review and collaborate. Admins also manage the workspace. Viewers have read-only access.</p>${button("Add invitation draft","add-invite")}</div><div class="setup-items">${draft.invites.map((x,i)=>`<article class="setup-item"><div><b>${esc(x.email)}</b><p>${x.role} · Draft</p></div>${button("Remove","remove-invite",`data-index="${i}" aria-label="Remove invitation to ${attr(x.email)}"`)}</article>`).join("")}</div><div class="setup-note">Invitations are saved as drafts only. No emails are sent and no access is granted in this prototype.</div>`;
    return `<div class="setup-intro"><span class="setup-kicker">Ready when you are</span><h1 tabindex="-1">Make this your starting point.</h1><p>Review your setup before adding it to the workspace. Everything can be refined later.</p></div><div class="setup-review">${[
      ["Your firm",esc(draft.firm)+`<small>${esc(draft.name)}${draft.office?" · "+esc(draft.office):""}</small>`,0],
      ["Clients",draft.clients.length?chips(draft.clients.map(c=>c.name)):"Add later",1],
      ["Issues & themes",draft.issues.length?draft.issues.map(i=>`<div class="setup-review-issue"><b>${esc(i.name)}</b><small>${i.themes.length} themes · ${i.keywords.length} keywords · ${i.clients.length?esc(i.clients.join(", ")):"No clients linked"}</small></div>`).join(""):"Add later",2],
      ["State coverage",draft.allStates?"All 50 states":chips(draft.states),3],
      ["Team",`${esc(draft.reviewer||draft.name)} · Initial client owner<small>${draft.invites.length} invitation draft${draft.invites.length===1?"":"s"} · No emails will be sent</small>`,4]
    ].map(([label,value,index])=>`<div><span>${label}</span><section>${value}</section>${button("Edit","step",`data-index="${index}" aria-label="Edit ${label}"`)}</div>`).join("")}</div><div class="setup-note">Your setup adds to this browser’s demo workspace. Existing records with matching names are reused. Bill suggestions use sample data and still need review.</div>`;
  }
  function page(){
    return `<div class="setup-shell"><header class="setup-top"><a href="#dashboard" class="brand"><span class="brand-mark">D</span><span>Dome</span></a><span>Firm setup</span>${button("Save & exit","exit")}</header><div class="setup-layout"><aside class="setup-progress"><span class="setup-kicker">Your workspace, your way</span><ol>${steps.map((s,i)=>`<li class="${i===draft.step?"current":i<draft.step?"done":""}"><button type="button" data-setup-action="step" data-index="${i}" ${i>draft.step?"disabled":""} ${i===draft.step?'aria-current="step"':""}><span>${i<draft.step?"✓":i+1}</span>${s}</button></li>`).join("")}</ol><p>Start small.<br>Build as you go.</p></aside><form id="firmSetupForm" class="setup-content"><div class="setup-mobile-step">Step ${draft.step+1} of ${steps.length} · ${steps[draft.step]}</div>${stepBody()}<p class="setup-error" id="setupError" role="alert" hidden></p><footer class="setup-footer"><div>${draft.step?button("← Back","back"):""}<small id="setupSaveStatus" role="status">${storageOK?"Progress saved in this browser":"Changes are not saved"}</small></div><div>${[1,2,4].includes(draft.step)?button("Skip for now","skip"):""}<button class="button primary" type="submit">${draft.step===5?"Finish setup →":"Continue →"}</button></div></footer></form></div></div>`;
  }
  function settings(){return `<div class="settings-section setup-settings"><div><span class="setup-kicker">Getting started</span><h2>Firm setup</h2><p>${draft.completed?`${esc(draft.firm)} · Setup complete. Review your configuration or add more detail.`:draft.started?`Your draft is saved at ${steps[draft.step].toLowerCase()}. Pick up where you left off.`:"Set up clients, policy priorities, state coverage, and your team in a few short steps."}</p></div><a class="button primary" href="#setup">${draft.completed?"Review setup":draft.started?"Resume setup":"Start firm setup"} →</a></div>`;}
  function suggestions(){return bills.filter(b=>(draft.allStates||draft.states.includes(b.state))&&b.issues.some(i=>draft.issues.some(x=>x.name===i)));}
  function dashboard(){
    if(!draft.started)return "";
    if(!draft.completed)return `<section class="setup-dashboard"><div><span class="setup-kicker">Continue setting up</span><h2>${esc(draft.firm||"Your firm workspace")}</h2><p>Your draft is saved. Next: ${steps[draft.step].toLowerCase()}.</p></div><a href="#setup" class="button secondary">Resume setup →</a></section>`;
    return `<section class="setup-dashboard setup-finished"><div><span class="setup-kicker">Firm setup complete</span><h2>${esc(draft.firm)}</h2><p>${draft.clients.length} client${draft.clients.length===1?"":"s"} · ${draft.issues.length} issue${draft.issues.length===1?"":"s"} · ${draft.allStates?50:draft.states.length} states · ${draft.invites.length} invitation draft${draft.invites.length===1?"":"s"}</p></div><a href="#setup" class="button secondary">Review setup</a><div class="setup-next"><h3>Your next step</h3><p>${suggestions().length?"Explore these sample bills connected to your selected issues and coverage. These are suggestions, not confirmed client matches.":"Add keywords and enrich client profiles to prepare for bill review. Live matching is not connected in this prototype."}</p><div class="setup-suggestions">${suggestions().map(b=>`<a href="#bill?id=${encodeURIComponent(b.id)}"><span class="setup-chip">Sample · Needs review</span><b>${esc(b.id)}</b><span>${esc(b.title)}</span><i aria-hidden="true">→</i></a>`).join("")}</div><div class="setup-next-links"><a href="#clients">Enrich client profiles →</a><a href="#keywords">Manage keywords →</a></div></div></section>`;
  }
  function error(message){const node=document.querySelector("#setupError");node.textContent=message;node.hidden=false;node.scrollIntoView({block:"nearest"});}
  function finish(){
    if(!draft.firm||!draft.name){move(0);error("Add your firm name and your name to finish.");return;}
    if(!draft.allStates&&!draft.states.length){move(3);error("Select at least one state, or choose all 50 states.");return;}
    const records={clients:[],issues:[],themes:[],keywords:[],clientProfiles:[],users:[]};let next=Date.now();
    if(!state.users.some(u=>u.name.toLowerCase()===draft.name.toLowerCase()))records.users.push({id:`setup-user-${next++}`,name:draft.name,role:"Workspace administrator",initials:initials(draft.name)});
    const find=(type,name)=>state[type].find(x=>(x.name||x.term).toLowerCase()===name.toLowerCase());
    for(const c of draft.clients){
      const old=find("clients",c.name), related=draft.issues.filter(i=>i.clients.includes(c.name)).map(i=>i.name);
      records.clients.push(old?{...old,issues:[...new Set([...old.issues,...related])]}:{id:next++,name:c.name,industry:c.industry||"Not specified",initials:initials(c.name),owner:draft.reviewer||draft.name,issues:related,bills:0,activity:"Just added",color:"green"});
      if(!state.clientProfiles.some(p=>p.client===c.name)&&c.context)records.clientProfiles.push({id:`setup-${next++}`,name:`${c.name} profile`,client:c.name,version:1,status:"Needs review",completeness:20,industry:c.industry,businessContext:c.context,markets:[],products:[],competencies:[],regulatoryExposure:[],priorities:[],sources:["Firm setup · user-provided context"],lastReviewed:"Not yet reviewed"});
    }
    for(const i of draft.issues){
      const old=find("issues",i.name);
      records.issues.push(old?{...old,clients:[...new Set([...old.clients,...i.clients])],themes:[...new Set([...old.themes,...i.themes])]}:{id:next++,name:i.name,description:"Policy priorities added during firm setup.",type:"Issue",color:"sage",bills:0,alerts:0,updated:"Just added",clients:i.clients,themes:i.themes});
      for(const name of i.themes){const existing=records.themes.find(t=>t.name.toLowerCase()===name.toLowerCase())||find("themes",name);const theme=existing?{...existing,issues:[...new Set([...existing.issues,i.name])]}:{id:next++,name,description:"Added during firm setup.",issues:[i.name],color:"sage"};records.themes=records.themes.filter(x=>x.id!==theme.id);records.themes.push(theme);}
      for(const term of i.keywords)if(!state.keywords.some(k=>k.term.toLowerCase()===term.toLowerCase()&&k.group===i.name))records.keywords.push({id:next++,term,match:"Contains",group:i.name,groupType:"Issue",hits:0,trend:0,themes:[]});
    }
    // Retain previously created records when revisiting setup with additional choices.
    for(const collection of Object.keys(records))records[collection]=[...(saved?.records?.[collection]||[]).filter(old=>!records[collection].some(x=>x.id===old.id)),...records[collection]];
    draft.completed=true;if(!persist(records)){draft.completed=false;error("Setup could not be saved. Please enable browser storage and try again.");return;}
    apply(records);location.hash="dashboard";showToast("Firm setup saved. Your workspace is ready to explore.");
  }
  document.addEventListener("input",e=>{
    if(!e.target.closest("#firmSetupForm"))return;
    if(e.target.matches("[data-setup-state-search]")){const q=e.target.value.toLowerCase();document.querySelectorAll("[data-setup-state-name]").forEach(x=>x.hidden=!x.dataset.setupStateName.includes(q));return;}
    if(e.target.matches("[data-setup-issue-field]")){draft.issues[+e.target.dataset.index][e.target.dataset.setupIssueField]=list(e.target.value);persist();}
    else capture();
    const status=document.querySelector("#setupSaveStatus");if(status)status.textContent=storageOK?"Progress saved in this browser":"Changes are not saved";
  });
  document.addEventListener("change",e=>{
    if(!e.target.closest("#firmSetupForm"))return;
    if(e.target.name==="coverage"){draft.allStates=e.target.value==="all";persist();render();}
    if(e.target.matches("[data-setup-state]")){const code=e.target.dataset.setupState;draft.states=e.target.checked?[...new Set([...draft.states,code])]:draft.states.filter(x=>x!==code);persist();const count=document.querySelector(".setup-state-header b");if(count)count.textContent=`${draft.states.length} states selected`;}
    if(e.target.matches("[data-setup-client-link]")){const i=draft.issues[+e.target.dataset.setupClientLink];i.clients=e.target.checked?[...new Set([...i.clients,e.target.value])]:i.clients.filter(x=>x!==e.target.value);persist();}
    if(e.target.name==="reviewer")capture();
  });
  document.addEventListener("click",e=>{
    const target=e.target.closest("[data-setup-action]");if(!target)return;
    const action=target.dataset.setupAction,index=+target.dataset.index;capture();
    const values=Object.fromEntries(new FormData(document.querySelector("#firmSetupForm")));
    if(action==="exit"){location.hash="settings";return;}
    if(action==="step"){move(index);return;}
    if(action==="back"){move(draft.step-1);return;}
    if(action==="skip"){move(draft.step+1);return;}
    if(action==="add-client"){
      const name=(values.clientName||"").trim();if(!name){error("Enter a client name before adding it.");return;}
      if(draft.clients.some(c=>c.name.toLowerCase()===name.toLowerCase())){error("That client is already in your setup.");return;}
      const existing=state.clients.find(c=>c.name.toLowerCase()===name.toLowerCase());draft.clients.push({name:existing?.name||name,industry:values.clientIndustry.trim(),context:values.clientContext.trim()});
      for(const name of ["clientName","clientIndustry","clientContext"])delete draft.fields[name];
    }
    if(action==="remove-client"){const name=draft.clients[index].name;draft.clients.splice(index,1);draft.issues.forEach(i=>i.clients=i.clients.filter(c=>c!==name));}
    if(action==="toggle-issue"){const t=templates[index],existing=draft.issues.findIndex(i=>i.name===t.name);if(existing>=0)draft.issues.splice(existing,1);else draft.issues.push({name:t.name,themes:[...t.themes],clients:[],keywords:[]});}
    if(action==="add-issue"){const name=(values.customIssue||"").trim();if(!name){error("Enter an issue name.");return;}if(draft.issues.some(i=>i.name.toLowerCase()===name.toLowerCase())){error("That issue is already selected.");return;}const existing=templates.find(t=>t.name.toLowerCase()===name.toLowerCase());draft.issues.push({name:existing?.name||name,themes:existing?.themes||[],clients:[],keywords:[]});}
    if(action==="remove-issue")draft.issues.splice(index,1);
    if(action==="select-states")draft.states=stateDirectory.map(x=>x[0]);
    if(action==="clear-states")draft.states=[];
    if(action==="add-invite"){const input=document.querySelector('[name="inviteEmail"]'),email=values.inviteEmail.trim().toLowerCase();if(!email||!input.checkValidity()){error("Enter a valid email address for the invitation draft.");input.focus();return;}if(draft.invites.some(i=>i.email===email)){error("An invitation draft already exists for this email.");return;}draft.invites.push({email,role:values.inviteRole});}
    if(action==="remove-invite")draft.invites.splice(index,1);
    if(action==="add-issue")delete draft.fields.customIssue;
    if(action==="add-invite"){delete draft.fields.inviteEmail;delete draft.fields.inviteRole;}
    persist();render();
  });
  document.addEventListener("submit",e=>{if(e.target.id!=="firmSetupForm")return;e.preventDefault();capture();if(draft.step===0&&(!draft.firm||!draft.name)){error("Add your firm name and your name to continue.");return;}if(draft.step===1&&e.target.elements.clientName.value.trim()){error("Add this client before continuing, or clear the client name.");return;}if(draft.step===2&&e.target.elements.customIssue.value.trim()){error("Add your custom issue before continuing, or clear its name.");return;}if(draft.step===3&&!draft.allStates&&!draft.states.length){error("Select at least one state, or choose all 50 states.");return;}if(draft.step===4&&e.target.elements.inviteEmail.value.trim()){error("Add the invitation draft before continuing, or clear the email.");return;}if(draft.step===5)finish();else move(draft.step+1);});
  function afterRender(){
    if(state.route!=="setup")return;
    for(const [name,value] of Object.entries(draft.fields)){const input=document.querySelector(`#firmSetupForm [name="${name}"]`);if(input)input.value=value;}
    document.querySelectorAll('.setup-progress [data-setup-action="step"]').forEach(button=>button.disabled=Number(button.dataset.index)>Math.max(draft.furthest,draft.step));
  }
  return {page,settings,dashboard,afterRender};
};

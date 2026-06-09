export const maxDuration = 60;

import { createClient } from "@supabase/supabase-js";
import { fetchWorkday } from "@/lib/fetchWorkday";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


// ===============================
// ROLE FILTER
// ===============================

const allowedRoles = [
  "data",
  "analyst",
  "business analyst",
  "software",
  "engineer",
  "developer",
  "frontend",
  "backend",
  "full stack",
  "cloud",
  "devops",
  "qa",
  "quality",
  "systems",
  "security",
  "cyber",
  "product",
  "operations",
  "machine learning",
  "ai",
  "sql",
  "power bi",
  "tableau",
  "database",
  "etl",
  "reporting"
];


function cleanText(v = "") {
  return String(v)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function hash(title, company, location, link) {
  return crypto
    .createHash("sha256")
    .update(
      `${title}|${company}|${location}|${link}`.toLowerCase()
    )
    .digest("hex");
}


function allowed(title="") {
  const t = title.toLowerCase();
  return allowedRoles.some(r=>t.includes(r));
}



// ===============================
// VISA / OPT CHECK
// ===============================

function analyzeEligibility(text=""){

const t=text.toLowerCase();


const block=[
"u.s. citizen",
"us citizen",
"u.s. citizens",
"us citizens",
"security clearance",
"secret clearance",
"top secret",
"ts/sci",
"public trust",
"green card only",
"permanent resident only",
"us persons only",
"requires citizenship",
"no sponsorship",
"will not sponsor",
"does not sponsor",
"without sponsorship",
"unable to sponsor",
"cannot sponsor"
];


if(block.some(x=>t.includes(x))){
return null;
}


const good=[
"visa sponsorship",
"sponsorship available",
"h1b",
"h-1b",
"stem opt",
"opt",
"f-1",
"cpt",
"ead",
"e-verify",
"new grad",
"early career"
];


if(good.some(x=>t.includes(x))){

return {
status:"OPT Friendly",
risk:"Low Risk",
chance:"High",
score:90,
reason:"Positive sponsorship/OPT signal detected"
};

}


return {
status:"Review Required",
risk:"Medium Risk",
chance:"Unknown",
score:50,
reason:"No restriction found"
};

}



// ===============================
// EXPERIENCE
// ===============================

function experience(text=""){

const t=text.toLowerCase();


const m =
t.match(/(\d+)\+?\s+years/) ||
t.match(/(\d+)\+?\s+yrs/);


if(m){

const y=Number(m[1]);

if(y<=2)
return ["Entry Level",y];

if(y<=5)
return ["Mid Level",y];

return ["Senior",y];

}


if(
t.includes("intern") ||
t.includes("junior") ||
t.includes("associate") ||
t.includes("new grad")
){
return ["Entry Level",0];
}


return ["Not specified",null];

}



// ===============================
// NORMALIZER
// ===============================

function normalizeJob(job){

const title=cleanText(job.title);
const desc=cleanText(job.description);
const location=cleanText(job.location || "United States");


if(!title || !job.applyLink)
return null;


if(!job.applyLink.startsWith("http"))
return null;


if(!allowed(title))
return null;


const full =
`${title} ${job.company} ${location} ${desc}`;


const visa = analyzeEligibility(full);

if(!visa)
return null;


const exp = experience(full);


// remove high senior jobs
if(exp[1]!==null && exp[1]>=8)
return null;



return {

title,
company:job.company,
location,

description:desc,
full_page_text:desc,

apply_link:job.applyLink,
apply_url:job.applyLink,

job_hash:hash(
title,
job.company,
location,
job.applyLink
),


source:job.source,
ats_platform:job.source,

posted_at:
job.postedAt || new Date().toISOString(),

last_seen_at:new Date().toISOString(),

is_active:true,
is_fresh:true,

opt_status:visa.status,
opt_risk_level:visa.risk,
sponsorship_chance:visa.chance,
apply_confidence:visa.score,
opt_risk_reason:visa.reason,
risk_reason:visa.reason,


experience_level:exp[0],
experience_years:exp[1],


role_category:"Technology / Business",

apply_ease:"Direct Apply",
source_type:"direct_employer_career_site",

remote:
title.toLowerCase().includes("remote") ||
location.toLowerCase().includes("remote"),

salary:"",
company_domain:"",
excluded_reason:"",
freshness_label:"Fresh",
scraped_at:new Date().toISOString()

};

}



// ===============================
// GREENHOUSE
// ===============================

async function fetchGreenhouse(source){

const r=await fetch(
`https://boards-api.greenhouse.io/v1/boards/${source.ats_slug}/jobs?content=true`
);


if(!r.ok)
return {rows:[],found:0};


const data=await r.json();


const rows=(data.jobs||[])
.map(j=>normalizeJob({

title:j.title,
company:source.company_name,
location:j.location?.name,
description:j.content,
applyLink:j.absolute_url,
source:"Greenhouse",
postedAt:j.updated_at

}))
.filter(Boolean);


return {rows,found:rows.length};

}



// ===============================
// SMARTRECRUITERS FULL SCAN
// ===============================

async function fetchSmartRecruiters(source){

const r=await fetch(
`https://api.smartrecruiters.com/v1/companies/${source.ats_slug}/postings?limit=25`
);


if(!r.ok)
return {rows:[],found:0};


const data=await r.json();

const rows=[];


for(const item of data.content||[]){

try{

const d=await fetch(
`https://api.smartrecruiters.com/v1/companies/${source.ats_slug}/postings/${item.id}`
);


if(!d.ok) continue;


const j=await d.json();


const desc=`
${j.jobAd?.sections?.jobDescription?.text||""}
${j.jobAd?.sections?.qualifications?.text||""}
${j.jobAd?.sections?.additionalInformation?.text||""}
`;


const row=normalizeJob({

title:j.name,
company:source.company_name,
location:j.location?.city || "United States",
description:desc,
applyLink:j.applyUrl || j.postingUrl,
source:"SmartRecruiters",
postedAt:j.releasedDate

});


if(row)
rows.push(row);


}catch(e){}

}


return {rows,found:rows.length};

}



// ===============================
// SAVE
// ===============================

async function save(rows){

if(!rows.length)
return 0;


await supabase
.from("jobs")
.upsert(rows,{
onConflict:"job_hash"
});


return rows.length;

}



// ===============================
// MAIN CRON
// ===============================

export async function GET(req){

const {searchParams}=new URL(req.url);


if(searchParams.get("secret")!==process.env.CRON_SECRET)
return Response.json({error:"Unauthorized"},{status:401});



const batch=Number(
searchParams.get("batch")||1
);


const size=25;

const from=(batch-1)*size;
const to=from+size-1;



const {data:sources}=await supabase
.from("company_sources")
.select("*")
.eq("active",true)
.in("ats_platform",[
"greenhouse",
"smartrecruiters",
"workday"
])
.or(
"ats_platform.neq.workday,careers_url.not.is.null"
)
.range(from,to);



let total=0;

let debug=[];


for(const s of sources||[]){

let result={rows:[],found:0};


if(s.ats_platform==="greenhouse")
result=await fetchGreenhouse(s);


if(s.ats_platform==="smartrecruiters")
result=await fetchSmartRecruiters(s);


if(s.ats_platform==="workday")
result=await fetchWorkday(s);



const saved=await save(result.rows);


total+=saved;


debug.push({
company:s.company_name,
ats:s.ats_platform,
found:result.found,
saved
});


}



return Response.json({

success:true,
batch,
totalSaved:total,
sourcesChecked:sources?.length||0,
debug

});


}

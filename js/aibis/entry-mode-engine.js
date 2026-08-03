(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BizOnEntryModeEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
const VERSION='0.1.0';
const DIMENSIONS=['control','speed','learning','capitalEfficiency','riskCompatibility','knowledgeProtection','localEmbeddedness','digitalScalability'];
function clamp(v,min=0,max=100){v=Number(v);return Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;}
function normalizeWeights(input={}){const out={};let total=0;DIMENSIONS.forEach(k=>{out[k]=clamp(input[k]??50);total+=out[k];});if(!total)return Object.fromEntries(DIMENSIONS.map(k=>[k,1/DIMENSIONS.length]));DIMENSIONS.forEach(k=>out[k]/=total);return out;}
function fit(a,b){return 100-Math.abs(clamp(a)-clamp(b));}
function distancePenalty(country={}){return clamp((clamp(country.institutionalDistance)+clamp(country.culturalDistance))/2);}
function scoreMode(mode,context={}){const w=normalizeWeights(context.priorities);const firm=context.firm||{};const country=context.country||{};const raw={
control:fit(mode.control,context.priorities?.control??50),speed:fit(mode.speed,context.priorities?.speed??50),learning:fit(mode.learning,context.priorities?.learning??50),capitalEfficiency:fit(100-mode.capitalRequirement,context.priorities?.capitalEfficiency??50),riskCompatibility:fit(100-mode.risk,context.priorities?.riskCompatibility??50),knowledgeProtection:fit(mode.knowledgeProtection,context.priorities?.knowledgeProtection??50),localEmbeddedness:fit(mode.localEmbeddedness,context.priorities?.localEmbeddedness??50),digitalScalability:fit(mode.digitalScalability,context.priorities?.digitalScalability??50)};
let weighted=0;DIMENSIONS.forEach(k=>weighted+=raw[k]*w[k]);
const capabilityFit=(fit(mode.minFinancialCapacity,firm.financialCapacity??50)+fit(mode.minInternationalExperience,firm.internationalExperience??50)+fit(mode.minDigitalCapability,firm.digitalCapability??50))/3;
const countryFit=clamp(mode.countryFit?.(country)??50);
const uncertainty=distancePenalty(country);
const evidenceAdjustment=clamp(mode.evidenceConfidence??50)/100;
const final=clamp(weighted*0.55+capabilityFit*0.2+countryFit*0.2+(100-uncertainty)*0.05);
return {modeId:mode.id,score:Number(final.toFixed(2)),components:{weightedPreferences:Number(weighted.toFixed(2)),capabilityFit:Number(capabilityFit.toFixed(2)),countryFit:Number(countryFit.toFixed(2)),distancePenalty:Number(uncertainty.toFixed(2))},confidence:Number((50+40*evidenceAdjustment).toFixed(0)),explanation:explain(mode,raw,firm,country)};}
function explain(mode,raw,firm,country){const strengths=[];const cautions=[];if(raw.control>=70)strengths.push('Phù hợp mức kiểm soát mong muốn');if(raw.speed>=70)strengths.push('Phù hợp tốc độ vào thị trường');if(raw.learning>=70)strengths.push('Hỗ trợ mục tiêu học hỏi quốc tế');if((firm.financialCapacity??50)<mode.minFinancialCapacity)cautions.push('Năng lực tài chính dưới ngưỡng khuyến nghị');if((firm.internationalExperience??50)<mode.minInternationalExperience)cautions.push('Kinh nghiệm quốc tế còn hạn chế');if((country.institutionalDistance??0)>65&&mode.localEmbeddedness<60)cautions.push('Khoảng cách thể chế cao nhưng mức gắn kết địa phương thấp');return {strengths,cautions};}
function rankModes(modes,context){return modes.map(m=>scoreMode(m,context)).sort((a,b)=>b.score-a.score);}
function compareModes(a,b,context){const sa=scoreMode(a,context),sb=scoreMode(b,context);return {winner:sa.score===sb.score?null:(sa.score>sb.score?a.id:b.id),difference:Number(Math.abs(sa.score-sb.score).toFixed(2)),results:[sa,sb]};}
return Object.freeze({VERSION,DIMENSIONS,clamp,normalizeWeights,scoreMode,rankModes,compareModes});});
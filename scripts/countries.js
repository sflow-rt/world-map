// author: InMon
// version: 3.0
// date: 11/4/2021
// description: Map traffic to countries
// copyright: Copyright (c) 2016-2021 InMon Corp.

var scale    = getSystemProperty('world-map.scale')    || 1;
var aggMode  = getSystemProperty('world-map.aggMode')  || 'sum';
var maxFlows = getSystemProperty('world-map.maxFlows') || 1000;
var minValue = getSystemProperty('world-map.minValue') || 0.01;
var agents   = getSystemProperty('world-map.agents')   || 'ALL';
var t        = getSystemProperty('world-map.t')        || 5;

function defineFlows() {
  setFlow('world-map-src',{
    keys:'if:[first:stack:.:ip:ip6]:ip:[country:ipsource]:[country:ip6source]',
    value:'bytes',
    n:20,
    t:t});
  setFlow('world-map-dst',{
    keys:'if:[first:stack:.:ip:ip6]:ip:[country:ipdestination]:[country:ip6destination]',
    value:'bytes',
    n:20,
    t:t});
}

function clearFlows() {
  clearFlow('world-map-src');
  clearFlow('world-map-dst');
}

lastQueryTime = 0;
flowsDefined = false;
setIntervalHandler(function(now) {
  if(flowsDefined && now - lastQueryTime > 60000) {
    clearFlows();
    flowsDefined = false;
  }
});

setHttpHandler(function(req) {
  var cc, result = [], totals = {};
  if(!flowsDefined) {
    defineFlows();
    flowsDefined = true;
  }
  lastQueryTime = Date.now();

  (activeFlows(agents,'world-map-src',maxFlows,minValue,aggMode) || []).forEach(el => totals[el.key] = (totals[el.key] || 0) + el.value);
  (activeFlows(agents,'world-map-dst',maxFlows,minValue,aggMode) || []).forEach(el => totals[el.key] = (totals[el.key] || 0) + el.value);
  for(cc in totals) {
    result.push({
      'country':cc.toLowerCase(),
      'radius':Math.max(1,Math.log10(totals[cc])*scale)
    }); 
  }
  return result;
});

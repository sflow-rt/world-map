// author: InMon
// version: 2.0
// date: 9/30/2020
// description: Map traffic to countries
// copyright: Copyright (c) 2016-2020 InMon Corp.

var scale    = getSystemProperty('world-map.scale')    || 1;
var aggMode  = getSystemProperty('world-map.aggMode')  || 'sum';
var maxFlows = getSystemProperty('world-map.maxFlows') || 1000;
var minValue = getSystemProperty('world-map.minValue') || 0.01;
var agents   = getSystemProperty('world-map.agents')   || 'ALL';
var t        = getSystemProperty('world-map.t')        || 5;

setFlow('world-map-src',{
  keys:'country:ipsource',
  value:'bytes',
  n:20,
  t:t});
setFlow('world-map-dst',{
  keys:'country:ipsource',
  value:'bytes',
  n:20,
  t:t});

setHttpHandler(function(req) {
  var cc, result = [], totals = {};
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

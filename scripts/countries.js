var scale    = getSystemProperty('world-map.scale')    || 1;
var aggMode  = getSystemProperty('world-map.aggMode')  || 'sum';
var maxFlows = getSystemProperty('world-map.maxFlows') || 1000;
var minValue = getSystemProperty('world-map.minValue') || 0.01;
var agents   = getSystemProperty('world-map.agents')   || 'ALL';
var t        = getSystemProperty('world-map.t')        || 5;

setFlow('world-map',{
  keys:'country:ipsource,country:ipdestination',
  value:'bytes',
  n:20,
  t:t});

setHttpHandler(function(req) {
   result = [];
   var flows = activeFlows(agents,'world-map',maxFlows,minValue,aggMode);
   if(flows) {
     let totals = {};
     for(let i = 0; i < flows.length; i++) {
       var[src,dst] = flows[i].key.split(',');
       let val = flows[i].value;
       totals[src] = (totals[src] || 0) + val;
       totals[dst] = (totals[dst] || 0) + val; 
     }
     for(let cc in totals) {
       result.push({
         'country':cc.toLowerCase(),
         'radius':Math.max(1,Math.log10(totals[cc])*scale)
       }); 
     }
   }
   return result;
});

var http            = require('http');  
var https           = require('https');
var fs              = require("fs");
var url             = require('url');   
var StringDecoder   = require("string_decoder").StringDecoder; 
var isPortTaken     = require("./isPortTaken");
var port            = isPortTaken.port;
var allowedRoots    = ["Hello","Login","User","Meow"].map(x=>x.toLowerCase());

const loadSite      = function(req,res){
    res.setHeader("Content-Type","text/json");
    var URL         = url.parse(req.url,true); 
    var QUR         = URL.query;  
    var SER         = URL.search; 
    var MET         = req.method; 
    var segment     = Object.keys(QUR).length==0 ?
                        req.url.split("/").map(x=>decodeURIComponent(x)).filter(x=>x) :
                        req.url.replace(SER,"").split("/").map(x=>decodeURIComponent(x)).filter(x=>x);
    var root        = typeof segment[0]!=="undefined" ? segment[0].toLowerCase() : '-1';
    var result      = {};
    var seg         = segment!='' ? segment.map(x=>x) : '';
    if(allowedRoots.indexOf(root)>=0){
        var decoder = new StringDecoder("utf-8");
        var resp    = '';
        req.on("data",function(x){
            resp   += decoder.write(x);
        });
        req.on("end",function(){
            resp   += decoder.end();
            if(MET=='GET') SER=='' ? '' : result.GET = QUR;
            if(MET=='POST') SER=='' ? '' : result.POST = QUR;
            resp=='' ?  '' : result.PayLoad = resp;
            if(seg!='') {  
            result.URLSegments = [];
                seg.forEach(x=>{
                    result.URLSegments.push(x);
                });
            }
            res.end(JSON.stringify(result));
        });
    }else{
        res.writeHead(404);
        result.notFound = "true";
        result.message  = "Sorry the page is not found";
        res.end(JSON.stringify(result));
    }
}
var certs            = {
    'cert': fs.readFileSync("./cert.crt"),
    'key': fs.readFileSync('./key.pem')
};
var ss              = https.createServer(certs,function(req,res){
    loadSite(req,res); 
});
var s               = http.createServer(function(req, res){
    loadSite(req,res);
});
isPortTaken.f(port).then(function(){
    s.listen(port,()=>console.log("Loaded on port "+port));
    var sport = parseInt(port)+1;
    ss.listen(sport,()=>console.log("Loaded on port "+sport));
}).catch(function(){
    s.listen(8080,()=>console.log("Port is taken\nUsing default port 8080"));
    ss.listen(8081,()=>console.log("Port is taken\nUsing default port 8081"));
});
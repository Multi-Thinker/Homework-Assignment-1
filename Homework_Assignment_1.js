
var http            = require('http');  // http helper
var url             = require('url');   // URL helper
var StringDecoder   = require("string_decoder").StringDecoder; // stream
var port            = 8080; // port
var allowedRoots    = ["Hello","Login","User","Meow"]; // allowed handlers
allowedRoots        = allowedRoots.map(x=>x.toLowerCase()); // to lower case for ease

http.createServer(function(req, res){
    /** JSON header */
    res.setHeader("Content-Type","text/json");
    /** variables */
    var URL     = url.parse(req.url,true); 
    var QUR     = URL.query;  // query {test:1, id:2}
    var SER     = URL.search; // search ?test=1&id=2
    var MET     = req.method; // GET,POST,PUT

    /** CHECK how many segments URL holds with and without query string */
    var segment  = Object.keys(QUR).length==0 ?
            req.url.split("/").map(x=>decodeURIComponent(x)).filter(x=>x) :
                req.url.replace(SER,"").split("/").map(x=>decodeURIComponent(x)).filter(x=>x);

    /** the first segment is root */
    var root     = typeof segment[0]!=="undefined" ? segment[0].toLowerCase() : '-1';
    /** Counting segments for printing purpose */
    var key      = 0;
    /** final result */
    var result   = {};
    /** Generating simple return response */
    var seg = segment!='' ? segment.map(x=>x) : '';
    /** if the segment is in allowed roots  */
    if(allowedRoots.indexOf(root)>=0){
        /** initiated the decoder and empty variable to record stream */
        var decoder = new StringDecoder("utf-8");
        var resp     = '';
        /** appending stream */
        req.on("data",function(x){
            resp += decoder.write(x);
        });
        /** printing values */
        req.on("end",function(){
            resp += decoder.end();
            /** if there is a GET request */
            if(MET=='GET') SER=='' ? '' : result.GET = QUR;
            /** the payload if any */
            resp=='' ?  '' : result.PayLoad = resp;
            /** URL segments >=1 */
            if(seg!='') {  
            result.URLSegments = [];
                seg.forEach(x=>{
                    result.URLSegments.push(x);
                });
            }
            res.end(JSON.stringify(result));
        });
    }else{
        /** segment not allowed */
        res.writeHead(404);
        result.notFound = "true";
        result.message  = "Sorry the page is not found";
        res.end(JSON.stringify(result));
    }
}).listen(port);
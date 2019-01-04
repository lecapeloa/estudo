var express = require('express'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

var server = express();

server.use(express.static('public'));

server.get('/video/:video?',(req, resp)=>{
    var file = path.resolve(__dirname, req.params.video);

    fs.stat(file, (err, stats)=>{
      var range = req.headers.range;
      var total = stats.size;
      if (range){
        var position =  range.replace(/bytes=/,"").split('-');
        var start = parseInt(position[0], 10);
         var end = position[1] ? parseInt(position[1],10):total-1;
         var chunksize = (end - start) + 1;

         resp.writeHead(206,{
           "Content-Range" : `bytes ${start}-${end}/${total}`,
           "Accept-Ranges": "bytes",
           "Content-Length": chunksize,
           "Content-Type":"video/mp4",
         });
      } else {
        resp.writeHead(200,{
          "Content-Length": total,
          "Content-Type":"video/mp4",
        });
      }
      var stream = fs.createReadStream(file,{start:start, end:end})
      .on('open',()=>{
        stream.pipe(resp);
      }).on('error', (err)=>{
        resp.end(err);
      });

    });

    //resp.send("Olá");
});

server.listen(3000);

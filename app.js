/**
 * Created by rudianto on 15-Apr-18.
 */
var http = require('http');
var url = require('url');
var qstring = require('querystring');
var router = require('routes')();
var view = require('swig');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: "127.0.0.1",
    port : 3306,
    database : "db_games",
    user : "root",
    password : ""
});
//read----------------------------------------------------
router.addRoute('/',function(req, res){
    connection.query("select * from t_games",function(err, rows, field){
        if (err) throw err;
        var html = view.compileFile('./template/index.html')({
            title : "Data Inventory Games",
            data : rows
        });
        res.writeHead(200,{"Content-Type" : "text/html"});
        res.end(html);
    });

});
//inert-----------------------------------------------------
router.addRoute('/insert',function (req, res) {
    if (req.method.toUpperCase() == "POST"){
        var data_post = "";
        req.on('data',function(chuncks){
            data_post += chuncks;
        });
        req.on('end',function(){
           data_post = qstring.parse(data_post);
           connection.query("insert into t_games set ?",data_post,function(err,field){
               if (err) throw err;
               res.writeHead(302,{"Location": "/"});
               res.end();
           });
        });
    }else{
        var html = view.compileFile('./template/form.html')({
            title : "Tambah Data Games"
        });
        res.writeHead(200,{"Content-Type":"text/html"});
        res.end(html);
    }

});
//update--------------------------------------------------
router.addRoute('/update/:id_games',function(req, res){

    connection.query("select * from t_games where ?",{
       id_games : this.params.id_games
    },function(err, rows, field){
        if(rows.length){//jika data ada
            var data = rows[0];
            if (req.method.toUpperCase() == "POST"){
                var data_post = "";
                req.on('data', function(chuncks){
                    data_post += chuncks;
                });
                req.on('end',function () {
                   data_post = qstring.parse(data_post);
                   connection.query("update t_games set ? where ?",[
                        data_post,
                       {id_games : data.id_games}
                   ],
                   function (err, fields){
                       if (err) throw err;
                       res.writeHead(302,{"Location" : "/"});
                       res.end();
                   });
                });
            }else{
                var html = view.compileFile('./template/form_update.html')({
                    title : "Form Update Games",
                    data : data
                });
                res.writeHead(200,{"Content-Type": "text/html"});
                res.end(html);
            }
        }else{
            var html = view.compileFile('./template/404.html')();
            res.writeHead(404,{"Content-Type":"text/html"});
            res.end(html);
        }
    });
});
//delete---------------------------------------------------
router.addRoute('/delete/:id_games',function (req, res) {
    connection.query("delete from t_games where ?",
        {
            id_games : this.params.id_games
        },
        function (err, fields) {
            if (err) throw err;
            res.writeHead(302,{"Location":"/"});
            res.end();
        }
    );

});
//---------------------------------------------------------

router.addRoute('/games',function(req, res){
    var html = view.compileFile('./template/games.html')();
    res.writeHead(200,{"Content-Type" : "text/html"});
    res.end(html);
});

http.createServer(function (req, res) {
    var path = url.parse(req.url).pathname;
    var match = router.match(path);
    if(match){
        match.fn(req, res);
    }
    else {
        var html = view.compileFile('./template/404.html')();
        res.writeHead(404,{"Content-Type":"text/html"});
        res.end(html);
    }


}).listen(8888);
console.log("server is running");
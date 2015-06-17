var mysql = require('mysql');
var express = require("express");
var conn = mysql.createConnection({
	host: 'ubuntu@ec2-52-10-60-210.us-west-2.compute.amazonaws.com',
	user: 'mrinal',
	password : "mrinal",
	database: 'temp_data_copy'
});

var app = express();
app.use(express.static(__dirname + "/public"));

conn.connect(function(err){
	if(err){
		console.log("Error in connection!!");
	}
	else{
		console.log("Connected..");
	}
});

app.get("/", function(req, res){
	conn.query('SELECT * from MSA_1998 LIMIT 2', function(err, rows, fields){
		conn.end();
		if(err){
			console.log('Error in GET');
		}	
		else{
			console.log(rows);
		}
	})
})

app.listen(8989);
console.log('Listening to 8989');
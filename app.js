var 
	gameport = process.env.PORT || 8080,

	express  = require('express'),
	http	 = require('http'),
	app      = express(),
	server	 = http.createServer(app);
	io       = require('socket.io').listen(server),
	
	UUID     = require('node-uuid'),
	verbose  = false;

//Tell the server to listen for incoming connections
server.listen(gameport);
console.log('\t :: Express :: Listening on port ' + gameport)

//By default, we forward the / path to index.html automatically.
app.get('/', function(req, res){ 
	res.sendFile( __dirname + '/public/index.html' );
});

app.get('/*', function(req, res, next) {
	//This is the current file they have requested
	var file = req.params[0]; 
	if(verbose) console.log('\t :: Express :: file requested : ' + file);
	res.sendFile(__dirname + '/' + file);
});

io.use(function(socket, next) {
	var handshakeData = socket.request;
	// if error do this:
	// next(new Error('not authorized'));
	next();
});

//Send client a unique ID so we can maintain the list of players.
io.on('connection', function (client) {
	//Generate a new UUID, looks something like 
	//5b2ca132-64bd-4513-99da-90e838ca47d1
	//and store this on their socket/connection
	client.userid = UUID();
	//tell the player they connected, giving them their id
	client.emit('onConnected', {id: client.userid});
	console.log('\t socket.io:: User ' + client.userid + ' connected');
	client.on('disconnect', function () {
		console.log('\t socket.io:: client disconnected ' + client.userid);
	});
});
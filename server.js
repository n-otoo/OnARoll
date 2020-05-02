var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
const uri = "mongodb+srv://rollon:nollor@onaroll-vvvb0.mongodb.net/test?retryWrites=true&w=majority";
const MongoClient = require('mongodb').MongoClient;

var port = PORT;
app.get('/', function(request, resp){

    resp.sendFile(__dirname + '/index.html');
});

app.get('/info', function(request, resp){
    resp.sendFile(__dirname + '/info.html');
});

//get an instance of the router
var api = express.Router();
// create routes for the api section

// Create a new user 
api.post('/users', function(req, res) {
    // Create a new user
    var user = {
        name: req.body.name,
        cameras: [{type: "120",make:"Pentax",model:"67", rolls:[{name:"test"}]}],
        rolls: [{camera: "670",name:"test", description:"test description", shots:[{iso:"100", ss:"1/60", aperture:2.4, description:"test roll description"}]}]
    };
    MongoClient.connect(uri, function(err, db){
        db.db("OnARoll").collection("users").insertOne(user, function(success){
            res.send("User:" + req.body.name + " successfully created");
        });
        console.log("Added user");
    });
   
    //res.send(searchroll);
});

api.get('/:user/:roll', function(req, res) {
    var rolls  = [{name:"yum"},{name:"yom"},{name:"yim"}];
    var searchroll;
    console.log(req.params.user);
    rolls.forEach((roll) => searchroll = roll.name == req.params.roll ? roll: null)
    res.json(searchroll);
});

// Get all rolls from a single user
api.get('/rolls/user/:user', function(req, res) {
    MongoClient.connect(uri, function(err, db){
      db.db("OnARoll").collection("users").find(
            { name: req.params.user }, { projection: { rolls: 1 } })
            .toArray((error,result) => res.json(orderByRolls(result[0].rolls)));

        //res.json(result);
        console.log("retrieved rolls from: " +  req.params.user);     
    });  
});

//Create a new roll for a single user
api.post('/rolls/user/:user', function(req, res) {
    MongoClient.connect(uri, function(err, db){
      var roll = req.body;
      roll.shots = [];

      // Add the new roll to the users roll collection
      db.db("OnARoll").collection("users").update(
        {name: req.params.user },
        { $push: {rolls: roll } }, 
        function(success){
        //res.send("Roll " + roll.name + " successfully created");
        // Add the new rolls to the users specific camera for that roll
            db.db("OnARoll").collection("users").update(
                {name: req.params.user, "cameras.model": roll.camera },
                { $push: {"cameras.$.rolls": {name : roll.name} } }, 
                function(error){
                res.send("Roll " + roll.name + " successfully created");
            });
      });   
      
        //res.json(result);
        console.log("retrieved rolls from: " +  req.params.user);     
    });  
});

// Get a users current cameras
api.get('/users/cameras/:user', function(req, res) {  
    console.log(req.params.user);
    MongoClient.connect(uri, function(err, db){
        db.db("OnARoll").collection("users").find(
              { name: req.params.user }, { projection: { cameras: 1 } })
              .toArray((error,result) => res.json(result));
  
          //res.json(result);
          console.log("retrieved rolls from: " +  req.params.user);     
      });  
});

// Create a new camera for a user
api.post('/users/cameras/:user', function(req, res) {
    var camera = req.body;
    camera.rolls = [];
    console.log(req.params.user);
    console.log(camera);
    MongoClient.connect(uri, function(err, db){
        db.db("OnARoll").collection("users").update(
            {name: req.params.user },
            { $push: {cameras: camera } }, 
            function(success){
            res.send("Camera " + camera.model + " successfully created");
        });
        console.log("Added camera "  + camera.model + " to user " + req.params.user);
    });
});

app.use(bodyParser.urlencoded({
    extended: false
  }));
app.use(bodyParser.json('application/json'));
app.use('/api', api);
app.listen(PORT);

console.log(" Express Server running on localhost port 8080");

function orderByRolls(rolls){
    rollsByCamera = {};
    rolls.forEach(function(roll){
        rollsByCamera[roll.camera] ? rollsByCamera[roll.camera].push(roll) : rollsByCamera[roll.camera] = [roll];
    });

    return rollsByCamera
}
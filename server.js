var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json('application/json'));
var bcrypt = require('bcrypt-nodejs');
const PORT = process.env.PORT || 8080;
const uri = "mongodb+srv://rollon:nollor@onaroll-vvvb0.mongodb.net/test?retryWrites=true&w=majority";
const MongoClient = require('mongodb').MongoClient;

app.get('/', function(request, resp){

    resp.sendFile(__dirname + '/index.html');
});
app.get('/OnARollController.js', function(request, resp){

    resp.sendFile(__dirname + '/OnARollController.js');
});
app.get('/OnARollLoginController.js', function(request, resp){

    resp.sendFile(__dirname + '/OnARollLoginController.js');
});
app.get('/signup.html', function(request, resp){

    resp.sendFile(__dirname + '/signup.html');
});

app.get('/about.html', function(request, resp){
    resp.sendFile(__dirname + '/info.html');
});

//get an instance of the router
var api = express.Router();
// create routes for the api section

// Get all rolls from a single user after logging in
api.post('/user/login/:user', function(req, res) {
    console.log(req.body);
    MongoClient.connect(uri, function(err, db){

      db.db("OnARoll").collection("users").findOne(
            { name: req.params.user }, { projection: { cameras:0, _id:0, rolls:0 } },
            function(error, result){
                
                console.log(result.hash);
                //console.log(bcrypt.compareSync(req.body.pass, result.hash));
                if(bcrypt.compareSync(req.body.pass, result.hash)){
                    db.db("OnARoll").collection("users").find(
                        { name: req.params.user }, { projection: { rolls: 1 } })
                        .toArray((error,result) => res.json(orderByRolls(result[0].rolls)));
                }

            });

        console.log("User logged on " +  req.params.user);     
    });  
});

// Create a new user 
api.post('/users', function(req, res) {
    // Create a new user   
    var user = {
        name: req.body.name,
        cameras: [],
        rolls: []
    };
    bcrypt.hash(req.body.pass, null, null, function(err, hash){
        if (err) return next(err);
        user.hash = hash;
    });
    MongoClient.connect(uri, function(err, db){
        db.db("OnARoll").collection("users").insertOne(user, function(success){
            res.send("User:" + req.body.name + " successfully created");
        });
        console.log("Added user");
    });
   
    //res.send(searchroll);
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
    camera._id = camera.make + new Date().valueOf() + camera.model;
    camera.rolls = [];
    console.log(req.params.user);
    console.log(camera);
    MongoClient.connect(uri, function(err, db){
        db.db("OnARoll").collection("users").update(
            {name: req.params.user },
            { $push: {cameras: camera } }, 
            function(success){
            res.send("Camera " + camera.model + " successfully created");
            
            // Add a palceholder roll
            db.db("OnARoll").collection("users").update(
        {name: req.params.user },
        { $push: {rolls: {name:"__PLCHOLDER", camera: camera.model} } }, 
        function(success){ console.log("Created Placeholder Roll") }); 
            
        });
        console.log("Added camera "  + camera.model + " to user " + req.params.user);
    });
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
      roll._id = req.body.name + new Date().valueOf() + roll.camera;
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
                { $push: {"cameras.$.rolls": {name : roll.name, id: roll._id} } }, 
                function(error){
                res.send("Roll " + roll.name + " successfully created");
            });
      });   
      
        //res.json(result);
        console.log("retrieved rolls from: " +  req.params.user);     
    });  
});

// Get all shots from a roll
api.get('/shots/roll/:user/:roll', function(req, res) {
    console.log(req.params.user + " " + req.params.roll); 
    MongoClient.connect(uri, function(err, db){
      db.db("OnARoll").collection("users").findOne(
            { name: req.params.user }, {projection: { rolls: { $elemMatch: { _id: req.params.roll } } }},
            function(error, result){
                console.log(error);
                res.json(result);
            });
            //.toArray((error,result) => res.json(result));

        //res.json(result);
        console.log("retrieved shot from: " +  req.params.user + "'s roll");     
    });  
});

//Create a new shot for a roll
api.post('/shots/roll/:user/:roll', function(req, res) {
    MongoClient.connect(uri, function(err, db){
      var shot = req.body;
      shot._id = shot.iso + new Date().valueOf() + shot.aperture;

        //res.send("Roll " + roll.name + " successfully created");
        // Add the new rolls to the users specific camera for that roll
        db.db("OnARoll").collection("users").update(
            {name: req.params.user, "rolls._id": req.params.roll },
            { $push: {"rolls.$.shots": shot } }, 
            function(error){
            res.send("shot " + shot.description + " successfully created");
        });

      
        //res.json(result);
        console.log("Added shot to " +  req.params.user);     
    });  
});






app.use('/api', api);
app.listen(PORT);

console.log(" Express Server running on port" + PORT);

function orderByRolls(rolls){
    rollsByCamera = {};
    rolls.forEach(function(roll){
        rollsByCamera[roll.camera] ? rollsByCamera[roll.camera].push(roll) : rollsByCamera[roll.camera] = [roll];
    });

    return rollsByCamera
}
'use strict';

const Hapi = require('hapi');
const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

var userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    age: { type: Number, required: true }
});


mongoose.connect('mongodb://localhost/newdb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('All is OK!');
});

var coll = db.collection('userCollection');
var counter = db.collection('counter');
var User = mongoose.model('User', userSchema);

/*
function getValueForNextSequence() {
    var sequenceDoc = counter.findAndModify({
        query: { _id: "item_id" },
        update: { $inc: { sequence_value: 1 } },
        new: true
    });
    console.log(counter.find().toArray());
    console.log("Function: " + sequenceDoc.sequence_value)
    return sequenceDoc.sequence_value;
}
*/

//Get all X
server.route({
    method: 'GET',
    path: '/users',
    handler: (request, h) => {
        return coll.find({}).toArray();
    }
});

//Post
server.route({
    method: 'POST',
    path: '/users',
    handler: (request, h) => {
        User = request.payload;
        /*
        console.log("------" + User.age + " " + User.name + " " + User.surname + " " + User._id);
        User._id = ;
        console.log("ID:  " + getValueForNextSequence());
        */
        coll.insertOne(User);
        return 'POST operation complete';
    }
});

//Get one X
server.route({
    method: 'GET',
    path: '/users/{userid}',
    handler: (request, h) => {
        var userid = encodeURIComponent(request.params.userid);
        return coll.find({ _id: ObjectId(userid) }).toArray();
    }
});

//Put
server.route({
    method: 'PUT',
    path: '/users/{userid}',
    handler: (request, h) => {
        var userid = encodeURIComponent(request.params.userid);
        coll.updateOne(
            { _id: ObjectId(userid) },
            { $set: { name: request.payload.name, surname: request.payload.surname, age: request.payload.age } },
            { upsert: true }
        );
        return 'PUT operation complete';
    }
});


//Delete X
server.route({
    method: 'DELETE',
    path: '/users/{userid}',
    handler: (request, h) => {
        var userid = encodeURIComponent(request.params.userid);
        coll.deleteOne({ _id: ObjectId(userid) });
        return 'DELETE user ' + userid;
    }
});

const init = async () => {

    await server.register({
        plugin: require('hapi-pino'),
        options: {
            prettyPrint: true,
            logEvents: ['response']
        }
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
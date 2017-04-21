// Load required modules
"use strict";

var fs = require("fs");
var https = require("https");               // https server core module
var http = require("http");                 // http server core module
var express = require("express");           // web framework external module
var serveStatic = require('serve-static');  // serve static files
var socketIo = require("socket.io");        // web socket external module
var easyrtc = require("../");               // EasyRTC external module

// Set process name
process.title = "node-easyrtc";

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var app = express();
app.use(serveStatic('../demos', {'index': ['index.html']}));

// Start Express http server on port 3000
var webServer = https.createServer(
{
    key: fs.readFileSync("privatekey.key"),
    cert: fs.readFileSync("certificate.crt")
},app).listen(8000);

// Start Socket.io so it attaches itself to Express server
var socketServer = socketIo.listen(webServer, {"log level":1});

easyrtc.setOption("logLevel", "debug");
easyrtc.setOption("roomDefaultEnable", false);

// To send special message to server to fetch list of current room occupants
var roomOccupantListener = function(connectionObj, msg, socketCallback, callback) {
    console.log("Message received from client.");
    if (msg.msgType == "getRoomOccupants") {
        var appObj = connectionObj.getApp();
        var successCB = function(error, data) {
            if (!error) {
                var output = {
                    "msgType": "roomOccupantList",
                    "msgData": data
                };
                for( var j in data) {
                    // console.log(easyrtc.idToName(j));
                }
                socketCallback(output);
            } else {
                socketCallback(connectionObj.util.getErrorMsg("MSG_REJECTED."));
            }
            callback(null);
        }
        appObj.getConnectionUsernames(successCB);
        console.log("Yay\n\n\n\n\n\n\n\n\n\n.");
    } else {
        easyrtc.events.emitDefault("easyrtcMsg", connectionObj, msg, socketCallback, callback);
    }
}

easyrtc.events.on("easyrtcMsg", roomOccupantListener);

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"), "Username = ", connectionObj.getUsername());
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});

//listen on port 8080
webServer.listen(8000, function () {
    console.log('listening on http://localhost:3000');
});

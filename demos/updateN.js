var selfEasyrtcid = "";
var haveSelfVideo = false;
var msgHist = new Array();
var sendHist = new Array();
var convoListIds = new Array();
var activeConversationPeer = "";
var currentUser = null;
var isUsernameTaken = false;
var isUsernameValidated = false;
var receivedMessageHtmlPrefix = "<div id=\"msg\" class=\"received\" style=\"float:left;background: black;color:white;margin-left: 5px;\"><b>";
var sentMessageHtmlPrefix = "<div id=\"msg\" class=\"sent\" style=\"float:right;background: white;color:black;margin-right: 5px;\"><b>";
var messageHtmlSeparator = "</b>";
var messageHtmlSuffix = "</div><br /><br/>";
var callerPending = null;
var myname = "";
var Users = new Array();
var ids = new Array();
var newdata = new Array();

function disable(domId) {
    document.getElementById(domId).disabled = "disabled";
}


function enable(domId) {
    document.getElementById(domId).disabled = "";
}


function addToConversation(senderId, msgType, content) {
    //console.log("addTo");
    // Escape html special characters, then add linefeeds.
    content = content.replace(/&/g,"&amp;");
    content = content.replace(/\n/g, "<br />");
    var name=""
    
    
    //Adding the message to corresponding message history
    for(var i = 0; i < msgHist.length; i++){
        if(convoListIds[i] == senderId){
            break;
        }
    }
    var str = easyrtc.idToName(senderId);
    var k = str.split(" ");
    if( k.length>1 ){
            name = k[0][0]+k[1][0];
    } else {
            name = k[0][0];
        }
    //var checker  = $('.Messages div:last');
    //console.log(sendHist);
        if(sendHist[i]==easyrtc.idToName(senderId)){
            //console.log("DO IT!!");
            msgHist[i] += '<div class="circle" id="circleselect" style="text-transform: capitalize;display: block;float: left;color:transparent ;background: transparent;width: 43px;line-height: 44px;height: 43px;">'+name+'</div>';
        }else{
            //console.log("NOBUDDY");
            msgHist[i] += '<div class="circle" id="circleselect" style="text-transform: capitalize;display: block;float: left;color: #fff;background: #000;width: 43px;line-height: 44px;height: 43px;">'+name+'</div>';
        }
    msgHist[i] += receivedMessageHtmlPrefix;
    msgHist[i] += messageHtmlSeparator + content;
    msgHist[i] += messageHtmlSuffix;
    //console.log(msgHist[i]);
    if(activeConversationPeer != senderId){
    sendHist[i] = easyrtc.idToName(senderId);}
    //Handling the case of message coming from active conversation peer
    if(activeConversationPeer == senderId){
        var k =""
        var div = document.getElementsByClassName("Messages");
        // var checker  = $('#msg').last();
        // console.log(checker.val());
        //console.log(sendHist);
        if(sendHist[i]==easyrtc.idToName(senderId)){
            //console.log("DO IT!!");
            k += '<div class="circle" id="circleselect" style="text-transform: capitalize;display: block;float: left;color: transparent;background: transparent;width: 43px;line-height: 44px;height: 43px;">'+name+'</div>';
        }else{
            //console.log("NOBUDDY");
            k += '<div class="circle" id="circleselect" style="text-transform: capitalize;display: block;float: left;color: #fff;background: #000;width: 43px;line-height: 44px;height: 43px;">'+name+'</div>';
        }
        
        
        k += receivedMessageHtmlPrefix + messageHtmlSeparator + content + messageHtmlSuffix;
        div[0].innerHTML += k;
        sendHist[i] = easyrtc.idToName(senderId);
    } else {
        document.getElementById(senderId).innerHTML = ""+document.getElementById(senderId).text+"&nbsp;"
                                                          + "<img src='orange-circle.png' height='15px' width='15px'>";
    }
    updateScroll();

    var snd = new Audio("notify.mp3");
    snd.play();
}

function validate() {
    //console.log("validate");
    var username = document.getElementById("userNameField").value;
    if (username) {
        easyrtc.setUsername(username);
    }

    //Connecting to server and fetching list of room occupants
    var successCB = function(msgType, msgData){
        var count = 0;
        for(var id in msgData ){
            if (msgData[id] == username){
              count++;
              if (count > 1){
                    $('#takentext').css('display', 'block');
                  //console.log("Username taken.");
                  easyrtc.disconnect();
                  return;
              }
            }
        }
      connect();
    };
    easyrtc.connect("easyrtc.instantMessaging", loginSuccess, loginFailure);
    easyrtc.sendServerMessage("getRoomOccupants",{ room:"default" }, successCB, 
          function(errorCode, errorText){
              easyrtc.disconnect();
              console.log(errorCode);
              console.log(errorText);
        });
}

function showPlaceholder() {
    $(function(){
        var text=["Please choose a user from the list to chat!"];
        var len = text[0].length;
        var i =0;
        var txt="";
        function start(){
            if(i<len){
                var txt = text[0][i];
                $('#text').append(txt).show();
                i++;
                setTimeout(start, 100);
            }
            if(i==len){
                $('.blinking-cursor').fadeOut(2000);
            }
        }
        start();
    });
}

function connect() {
    //console.log("connect");
    showPlaceholder();

    //Udating UI to show next div
    document.body.style.backgroundImage="none";
    document.getElementById("target").style.display="none";
    document.getElementById("tc").style.display="block";

    //Finishing connection formalities
    easyrtc.enableDataChannels(true);
    easyrtc.setRoomOccupantListener(convertListToButtons);
    easyrtc.setPeerListener(addToConversation);
    easyrtc.joinRoom("default1", null, null, loginFailure);
 }

function hangup() {
    easyrtc.hangupAll();
}

function clearConnectList() {
    //console.log("Clearlist");
    var otherClientDiv = document.getElementById("otherClientsVid");
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
}

function sendOnEnter() {
    sendStuffWS(currentUser);
}

function convertListToButtons (roomName, data, isPrimary) {
    Users = [];
    clearConnectList();

    var otherClientDiv1 = document.getElementById("otherClientsVid");
    newdata = data;
    for(var easyrtcid in data){
        //Locating corresponding list button
        var i=0;
        for(; i<convoListIds.length; i++){
            if(convoListIds[i] == easyrtcid){
                break;
            }
        }
        if (i >= convoListIds.length) {
            convoListIds[i]=easyrtcid;
            msgHist[i]="";
        }

        var button1 = document.createElement("a");
        button1.setAttribute("class", "UsersActive");
        button1.setAttribute("id", easyrtcid);
        var label = document.createTextNode(easyrtc.idToName(easyrtcid));
        button1.appendChild(label);
        otherClientDiv1.appendChild(button1);
        
        Users.push({'name':easyrtc.idToName(easyrtcid), 'id':easyrtcid});
        //console.log("Tobuttons");
        
        ids.push(easyrtcid);
        button1.onclick = function (easyrtcid) {
            return function(){
                //Updating navbar UI elements on clicking a conversation
                var str = easyrtc.idToName(easyrtcid);
                var k = str.split(" ");
                document.getElementById("select").innerHTML=easyrtc.idToName(easyrtcid);
                document.getElementById("select").style.textTransform = "capitalize";
                document.getElementById("circleselectname").style.display="block";
                if( k.length>1 ){
                    document.getElementById("circleselectname").innerHTML = k[0][0]+k[1][0];
                } else {
                    document.getElementById("circleselectname").innerHTML = k[0][0];
                }

                var div = document.getElementsByClassName('Messages');
                   $('.Messages').animate({
                      scrollTop: document.body.scrollHeight + document.getElementById('checking').scrollHeight
                   }, 500);

                //Highlighting corresponding entry in conversation list
                for(var w in data) {
                    if (w!= easyrtcid) {
                        document.getElementById(w).style.background="transparent";
                    }
                }
                document.getElementById(easyrtcid).style.background = "rgba(255, 104, 0, 0.9)";
                document.getElementById(easyrtcid).style.color = "white";

                //Updating onclick functions
                currentUser = easyrtcid;
                document.getElementById("sendMessageText").focus();
                document.getElementById("SendButton").onclick = function(easyrtcid) {
                    return function() {
                        sendStuffWS(easyrtcid);
                    };
                }(easyrtcid);
                document.getElementById("CallButton").onclick = function(easyrtcid) {
                    return function() {
                        performCall(easyrtcid);
                    };
                }(easyrtcid);
                document.getElementById("CallButton1").onclick = function(easyrtcid) {
                    return function() {
                        performCall(easyrtcid);
                    };
                }(easyrtcid);

                //Loading message history
                var msgarea = document.getElementsByClassName("Messages");
                for(var x=0;x<convoListIds.length;x++)
                {
                  if(convoListIds[x]==easyrtcid)
                  {
                    break;
                  }
                }
                msgarea[0].innerHTML = msgHist[x];
                activeConversationPeer = easyrtcid;
                this.innerHTML = easyrtc.idToName(easyrtcid);
            };
        }(easyrtcid);

        
    }
    change();
}

function sendStuffWS(otherEasyrtcid) {
    //Sending data to other peer
    var text = $('#sendMessageText').html();
    if(text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }
    easyrtc.sendDataWS(otherEasyrtcid, "message",  text);
    
    //Reflecting changes in message history
    text = text.replace(/&/g,'&amp;');
    text = text.replace(/\n/g, '<br />');
    for(var i = 0; i < msgHist.length; i++) {
        if(convoListIds[i] == otherEasyrtcid) {
          break;
        }
    }
    var using;
    var k = myname.split(" ");
    if( k.length>1 ){
            using = k[0][0]+k[1][0];
    } else {
            using = k[0][0];
        }

    var checker  = $('.Messages div:last');

    var chatarea = document.getElementsByClassName("Messages");
    //console.log(checker.html());
    var toggle = 0;
        if(checker.hasClass('sent')){
            if(toggle != 1)
            //console.log("DO IT!!2");
            msgHist[i] += '<div class="circle" id="circleselect" style="text-transform: capitalize;display: block;float: right;color: transparent;background: transparent;width: 43px;line-height: 44px;height: 43px;">'+using+'</div>';
            chatarea[0].innerHTML += '<div class="circle" id="circleselect" style="text-transform: capitalize;display: block;float: right;color: transparent;background: transparent;width: 43px;line-height: 44px;height: 43px;">'+using+'</div>';
            toggle = 1;
        }else{

            //console.log("NOBUDDY2");
            msgHist[i] += '<div class="circle" id="circleselect" style="text-transform: capitalize;display: block;float: right;color: #000;background: #fff;width: 43px;line-height: 44px;height: 43px;">'+using+'</div>';
            chatarea[0].innerHTML +='<div class="circle" id="circleselect" style="text-transform: capitalize;display: block;float: right;color: #000;background: #fff;width: 43px;line-height: 44px;height: 43px;">'+using+'</div>';
        }
    //Updating history and chat area
    msgHist[i] +=  sentMessageHtmlPrefix + messageHtmlSeparator + text;
    msgHist[i] += messageHtmlSuffix;
    chatarea[0].innerHTML += sentMessageHtmlPrefix + messageHtmlSeparator + text;
    chatarea[0].innerHTML += messageHtmlSuffix;
    sendHist[i] = "Me";
    $('#sendMessageText').html("");
    $('#sendMessageText').focus();
    updateScroll();
}

function setUpMirror() {
    if( !haveSelfVideo) {
        var selfVideo = document.getElementById("selfVideo");
        easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
        selfVideo.muted = true;
        haveSelfVideo = true;
    }
}

function performCall(otherEasyrtcid) {
    easyrtc.hangupAll();
    callAndWait(otherEasyrtcid);
}

function callAndWait(otherEasyrtcid) {
    //Making the call
    var acceptedCB = function(accepted, easyrtcid) {
        if( !accepted ) {
            //Showing call rejected box
            document.getElementById("callWaitingLabel").innerHTML = "Sorry, your call to " + easyrtc.idToName(easyrtcid) + " was rejected";
            document.getElementById("callCancelButton").style.display = "none";
            easyrtc.showError("CALL-REJECTED", "Sorry, your call to " + easyrtc.idToName(easyrtcid) + " was rejected");
            easyrtc.closeLocalMediaStream();
            enable("otherClientsVid");
            setTimeout(function(){
                document.getElementById("callWaitingBox").style.display = "none";
            }, 2000);
        } else {
            document.getElementById("callWaitingBox").style.display = "none";
        }
    };
    var successCB = function() {
        if( easyrtc.getLocalStream()) {
            setUpMirror();
        }
        enable("hangupButton");
        document.getElementById("hangupButton").style.display="block";
    };
    var failureCB = function() {};
    easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);

    //Handling call waiting box
    document.getElementById("callWaitingBox").style.display = "block";
    document.getElementById("callWaitingLabel").innerHTML = "Waiting for " + easyrtc.idToName(otherEasyrtcid) + " to accept your call";
    document.getElementById("callCancelButton").onclick = function() {
        // Releasing camera handle
        easyrtc.closeLocalMediaStream();
        document.getElementById("callWaitingBox").style.display = "none";
        easyrtc.hangup(otherEasyrtcid);
    }
}

function loginSuccess(easyrtcid) {
    //console.log("loginsucc");
    enable("otherClients");
    selfEasyrtcid = easyrtcid;
    document.getElementById("iam").innerHTML =  document.getElementById("userNameField").value;
    myname = document.getElementById("userNameField").value;
}


function loginFailure(errorCode, message) {
    console.log("Login Failed.\n" + message);
}

function updateScroll(){
    var element = document.getElementsByClassName("Messages");
    element[0].scrollTop = element[0].scrollHeight;
}

function disconnect(){
    easyrtc.hangupAll();
}

easyrtc.setStreamAcceptor( function(easyrtcid, stream) { //Called on both sides when a call is accepted
    setUpMirror();
    var video = document.getElementById("callerVideo");
    video.style.display="block";
    easyrtc.setVideoObjectSrc(video,stream);
    enable("hangupButton");
    document.getElementById("hangupButton").style.display="block";
});

easyrtc.setOnStreamClosed( function (easyrtcid, stream, streamName) { //Called on both sides when a call is ended
    easyrtc.setVideoObjectSrc(document.getElementById("callerVideo"), null);
    easyrtc.closeLocalMediaStream();
    disable("hangupButton");
    easyrtc.clearMediaStream( document.getElementById("selfVideo"));
    document.getElementById("hangupButton").style.display="none";
    document.getElementById("callerVideo").style.display="none";
});

easyrtc.setCallCancelled( function(easyrtcid){ // Called when caller cancels a call before receiver accepts
    if( easyrtcid === callerPending) {
        document.getElementById("acceptCallBox").style.display = "none";
        callerPending = false;
    }
});

easyrtc.setAcceptChecker(function(easyrtcid, callback) {
    //Displaying accept call box
    document.getElementById("acceptCallBox").style.display = "block";
    callerPending = easyrtcid;
    if(easyrtc.getConnectionCount() > 0) {
        document.getElementById("acceptCallLabel").innerHTML = "Drop current call and accept new from " + easyrtc.idToName(easyrtcid) + " ?";
    }
    else {
        document.getElementById("acceptCallLabel").innerHTML = "Accept incoming call from " + easyrtc.idToName(easyrtcid) + " ?";
    }

    //Linking onClick function for Accept and Reject buttons
    var acceptTheCall = function(wasAccepted) {
        document.getElementById("acceptCallBox").style.display = "none";
        if( wasAccepted && easyrtc.getConnectionCount() > 0 ) {
            easyrtc.hangupAll();
        }
        callback(wasAccepted);
        callerPending = null;
    };
    document.getElementById("callAcceptButton").onclick = function() {
        acceptTheCall(true);
    };
    document.getElementById("callRejectButton").onclick =function() {
        acceptTheCall(false);
    };
});

function flex(event, roomName, data, isPrimary){
    data = newdata;
    var easyrtcid = event.target.id;
    $('#'+easyrtcid).find('img').css('display','none');
    var str = easyrtc.idToName(easyrtcid);
                var k = str.split(" ");
                document.getElementById("select").innerHTML=easyrtc.idToName(easyrtcid);
                document.getElementById("select").style.textTransform = "capitalize";
                document.getElementById("circleselectname").style.display="block";
                if( k.length>1 ){
                    document.getElementById("circleselectname").innerHTML = k[0][0]+k[1][0];
                } else {
                    document.getElementById("circleselectname").innerHTML = k[0][0];
                }

                var div = document.getElementsByClassName('Messages');
                   $('.Messages').animate({
                      scrollTop: document.body.scrollHeight + document.getElementById('checking').scrollHeight
                   }, 500);

                //Highlighting corresponding entry in conversation list
                for(var w in data) {
                    if (w!= easyrtcid) {
                        document.getElementById(w).style.background="transparent";
                    }
                }
                document.getElementById(easyrtcid).style.background = "rgba(255, 104, 0, 0.9)";
                document.getElementById(easyrtcid).style.color = "white";

                //Updating onclick functions
                currentUser = easyrtcid;
                document.getElementById("sendMessageText").focus();
                document.getElementById("SendButton").onclick = function(easyrtcid) {
                    return function() {
                        sendStuffWS(easyrtcid);
                    };
                }(easyrtcid);
                document.getElementById("CallButton").onclick = function(easyrtcid) {
                    return function() {
                        performCall(easyrtcid);
                    };
                }(easyrtcid);
                document.getElementById("CallButton1").onclick = function(easyrtcid) {
                    return function() {
                        performCall(easyrtcid);
                    };
                }(easyrtcid);

                //Loading message history
                var msgarea = document.getElementsByClassName("Messages");
                for(var x=0;x<convoListIds.length;x++)
                {
                  if(convoListIds[x]==easyrtcid)
                  {
                    break;
                  }
                }
                msgarea[0].innerHTML = msgHist[x];
                activeConversationPeer = easyrtcid;
                this.innerHTML = easyrtc.idToName(easyrtcid);
}

function change(){
    //console.log("Here!");
    //console.log(Users);
    var appElement = document.querySelector('[ng-app=myApp]');
    var $scope = angular.element(appElement).scope();
    $scope.$apply(function() {
        $scope.names = Users;
    });
}


angular.module('myApp', []).controller('namesCtrl', function($scope) {
    
    //$scope.names = Users;
    
});


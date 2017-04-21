//
//Copyright (c) 2016, Skedans Systems, Inc.
//All rights reserved.
//
//Redistribution and use in source and binary forms, with or without
//modification, are permitted provided that the following conditions are met:
//
//    * Redistributions of source code must retain the above copyright notice,
//      this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
//ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
//LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
//CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
//CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
//ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
//POSSIBILITY OF SUCH DAMAGE.
//
var selfEasyrtcid = "";
var selfusernm = "";
function addToConversation(who, msgType, content) {
    // Escape html special characters, then add linefeeds.
    content = content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    content = content.replace(/\n/g, '<br />');
    document.getElementById(who).innerHTML +=
    "<b>" + easyrtc.idToName(who) + ":</b>&nbsp;" + content + "<br />";
}


function connect() {
    easyrtc.setPeerListener(addToConversation);
    easyrtc.setRoomOccupantListener(convertListToButtons);
    var username = document.getElementById("userNameField").value;
    if (username) {
        easyrtc.setUsername(username);
    }
    easyrtc.connect("easyrtc.instantMessaging", loginSuccess, loginFailure);
}


function convertListToButtons (roomName, occupants, isPrimary) {
    var otherClientDiv = document.getElementById('otherClients');
    var msgHistory = new Array();
    var msgID = new Array();
    var children = otherClientDiv.children;
    var len = children.length;
    for(var i = 0; i<children.length;i+=2)
    {
        msgHistory[i] = children[i].innerHTML;
        msgID[i] = children[i].id;
    }
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
    for(var easyrtcid in occupants) {
        var msgfield = document.createElement('div');
        msgfield.setAttribute('id',easyrtcid);
        msgfield.setAttribute('class','conversation');
        for(var i = 0; i<len; i+=2)
        {
            if(msgID[i]==easyrtcid)
            {
                msgfield.innerHTML=msgHistory[i];
            }
        }
        var button = document.createElement('button');
        button.onclick = function(easyrtcid) {
            return function() {
                sendStuffWS(easyrtcid);
            };
        }(easyrtcid);
        var label = document.createTextNode("Send to " + easyrtc.idToName(easyrtcid));
        button.appendChild(label);
        otherClientDiv.appendChild(msgfield);
        otherClientDiv.appendChild(button);
    }
}


function sendStuffWS(otherEasyrtcid) {
    var text = document.getElementById('sendMessageText').value;
    if(text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }

    easyrtc.sendDataWS(otherEasyrtcid, "message",  text);
    text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    text = text.replace(/\n/g, '<br />');
    document.getElementById(otherEasyrtcid).innerHTML +=
    "<b>" + "Me" + ":</b>&nbsp;" + text + "<br />";    
    document.getElementById('sendMessageText').value = "";
}


function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    document.getElementById("iam").innerHTML = "I am " + easyrtc.idToName(easyrtcid);
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}
var onAuthenticate = function(socket, easyrtcid, appName, username, credential, easyrtcAuthMessage, next){
  if (appName == "adminSite" && username != "handsomeJack"){
    next(new easyrtc.util.ConnectionError("Failed our private auth."));
  }
  else {
    next(null);
  }
};

easyrtc.events.on("authenticate", onAuthenticate);
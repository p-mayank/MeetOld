var selfEasyrtcid = "";
var msgHist = new Array();
var msgId = new Array();
var msgactv = "";

function addToConversation(who, msgType, content) {
  // Escape html special characters, then add linefeeds.
  content = content.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  content = content.replace(/\n/g, "<br />");
  for(var i = 0; i < msgHist.length; i++)
  {
    if(msgId[i] == who)
    {
      break;
    }
  }
  msgHist[i] += "<b>" + easyrtc.idToName(who) + ":</b>&nbsp;" + content + "<br />";
  var snd = new Audio("notify.wav");
  snd.play();
  if(msgactv==who)
  {
    var div = document.getElementsByClassName("Messages");
    div[0].innerHTML += "<b>" + easyrtc.idToName(who) + ":</b>&nbsp;" + content + "<br />";
  }
  /*if(document.getElementById(who))
  {
    document.getElementById(who).innerHTML +=
    "<b>" + easyrtc.idToName(who) + ":</b>&nbsp;" + content + "<br />";
  }*/
  else
  {
      document.getElementById(who).innerHTML = "<b><i>"+document.getElementById(who).text+"</i> </b>"+ "<img src='orange-circle.png' height='15px' width='15px'>";//place for notification code
  }
  updateScroll();
} 
function searchKeyPress(e)
{
    // look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13)
    {
      connect();
        document.getElementById('userNameField').click();
        return false;
    }
    return true;
}

function connect() {
  var username = document.getElementById("userNameField").value;
  document.getElementById("target").style.display="none";
  document.getElementById("tc").style.display="block";
  if (username) {
    easyrtc.setUsername(username);
  }
  easyrtc.setVideoDims(800,450);
  easyrtc.setRoomOccupantListener(convertListToButtons);
  easyrtc.easyApp("easyrtc.audioVideoSimple", "selfVideo", ["callerVideo"], loginSuccess, loginFailure);
  easyrtc.setPeerListener(addToConversation);
  easyrtc.connect("easyrtc.instantMessaging", loginSuccess, loginFailure);
 }
 
 
function clearConnectList() {
  var otherClientDiv = document.getElementById("otherClientsVid");
  while (otherClientDiv.hasChildNodes()) {
    otherClientDiv.removeChild(otherClientDiv.lastChild);
  }
}

function convertListToButtons (roomName, data, isPrimary) {
  clearConnectList();
  /*var otherClientDiv = document.getElementById('otherClients');
    var msgHistory = new Array();
    var msgID = new Array();
    var children = otherClientDiv.children;
    var len = children.length;
    for(var i = 0; i<children.length;i++)
    {
        msgHistory[i] = children[i].children[0].innerHTML;
        msgID[i] = children[i].children[0].id;
    }
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }
*/
  var otherClientDiv1 = document.getElementById("otherClientsVid");
  for(var easyrtcid in data) {
    var i=0;
    for(; i<msgId.length;i++)
    {
      if(msgId[i]==easyrtcid)
      {
        break;
      }
    }  
    if(i>=msgId.length)
    {
      msgId[i]=easyrtcid;
      msgHist[i]="";
    }
    var button1 = document.createElement("a");
    button1.setAttribute("class", "UsersActive");
    button1.setAttribute("id",easyrtcid);
    button1.onclick = function(easyrtcid) {
      return function(){
      document.getElementById("SendButton").onclick = function(easyrtcid) {
        console.log("Here!!!");
        return function() {
          sendStuffWS(easyrtcid);
        };
      }(easyrtcid);
      document.getElementById("CallButton").onclick = function(easyrtcid) {
        return function() {
          performCall(easyrtcid);
        };
      }(easyrtcid);
      var msgarea = document.getElementsByClassName("Messages");
      for(var x=0;x<msgId.length;x++)
      {
        if(msgId[x]==easyrtcid)
        {
          break;
        }
      }
      msgarea[0].innerHTML = msgHist[x];
      msgactv = easyrtcid;
      button1.innerHTML = easyrtc.idToName(easyrtcid);
    };
    }(easyrtcid);
    /*button1.onclick = function(easyrtcid) {
      return function() {
        performCall(easyrtcid);
      };
    }(easyrtcid);*/
    /*var msgfield = document.createElement('div');
    msgfield.setAttribute('id',easyrtcid);
    msgfield.setAttribute('class','conversation');
    for(var i = 0; i<len; i++)
    {
      if(msgID[i]==easyrtcid)
      {
        msgfield.innerHTML=msgHistory[i];
      }
    }
    var button = document.createElement("button");
    button.setAttribute("id", "text");
    button.setAttribute("class", "btn btn-primary btn-xl page-scroll");
    button.setAttribute("style", "width:100%;");
    button.onclick = function(easyrtcid) {
      console.log("Here!!!");
      return function() {
        sendStuffWS(easyrtcid);
      };
    }(easyrtcid);

    var label = document.createTextNode("Send to " + easyrtc.idToName(easyrtcid));
    button.appendChild(label);
    var div=document.createElement("div");
    div.setAttribute("class","convcontainer")
    div.appendChild(msgfield);
    div.appendChild(button);
    otherClientDiv.appendChild(div);*/
    
    /*if( !otherClientDiv.hasChildNodes() ) {
      otherClientDiv.innerHTML = "<em>Nobody else logged in to talk to...</em>";
    }*/
 
    var label = document.createTextNode(easyrtc.idToName(easyrtcid));
    button1.appendChild(label);
    otherClientDiv1.appendChild(button1);
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
     for(var i = 0; i < msgHist.length; i++)
      {
        if(msgId[i] == otherEasyrtcid)
        {
          break;
        }
      }
      msgHist[i] += "<b>" + "Me" + ":</b>&nbsp;" + text + "<br />";
    var chatarea = document.getElementsByClassName("Messages");
    chatarea[0].innerHTML +=
    "<b>" + "Me" + ":</b>&nbsp;" + text + "<br />";    
    document.getElementById('sendMessageText').value = "";
    document.getElementById('sendMessageText').focus();
    updateScroll();
}
 
 
function performCall(otherEasyrtcid) {
  easyrtc.hangupAll();
  var successCB = function() {};
  var failureCB = function() {};
  easyrtc.call(otherEasyrtcid, successCB, failureCB);
}
 
 
function loginSuccess(easyrtcid) {
  selfEasyrtcid = easyrtcid;
  document.getElementById("iam").innerHTML =  easyrtc.idToName(easyrtcid);
}
 
 
function loginFailure(errorCode, message) {
  console.log("Error");
  //easyrtc.showError(errorCode, message);
}

function updateScroll(){
    var element = document.getElementsByClassName("Messages");
    element[0].scrollTop = element[0].scrollHeight;
}
$(document).ready(function () {
  var trigger = $('.hamburger'),
      overlay = $('.overlay'),
     isClosed = false;

    trigger.click(function () {
      hamburger_cross();      
    });

    function hamburger_cross() {

      if (isClosed == true) {          
        overlay.hide();
        trigger.removeClass('is-open');
        trigger.addClass('is-closed');
        isClosed = false;
      } else {   
        overlay.show();
        trigger.removeClass('is-closed');
        trigger.addClass('is-open');
        isClosed = true;
      }
  }
  
  $('[data-toggle="offcanvas"]').click(function () {
        $('#wrapper').toggleClass('toggled');
  });  
});

//connect to server and retain the socket
//connect to same host that served the document

//const socket = io('http://' + window.document.location.host)
const socket = io() //by default connects to same server that served the page


let clientConnected = false
let username = ""

//sending messages to all valid users connected 
socket.on('serverSays', function(message) {
  if (username != '') { 
    let msgDiv = document.createElement('div')
    
    msgDiv.textContent = message
    
    let msgSplit = msgDiv.textContent.split(':')
    let currSender = msgSplit[0].trim()
 
    if (currSender == username) { //check if the username is the message sender
      msgDiv.className = 'sentMsg'
      document.getElementById('messages').appendChild(msgDiv)
    }
    else { //if receiving the message
      msgDiv.className = 'othersMsg'
      document.getElementById('messages').appendChild(msgDiv)
    }
    
  }
})


//sending private messages to users
socket.on('serverSaysPrivate', function(message) {
  //console.log("receive private message ")
  if (username != '') {
    let msgDiv = document.createElement('div')
  
    msgDiv.textContent = message
    
    let msgSplit = msgDiv.textContent.split(':')
    let currSender = msgSplit[0].trim() //get the username who sends the message
    let recipients = msgSplit[1].split(',') //get a list of private usernames to receive the message

    for(let i=0; i<recipients.length;i++){
      recipients[i] = recipients[i].trim() //trim of extra spaces
    }

    msgDiv.textContent = currSender + ':' + msgSplit[2] //since I don't need to check for ':' in the message, I assume users never include ':' in the message

    if (currSender == username) {
      msgDiv.className = 'privateMsgSent' 
      document.getElementById('messages').appendChild(msgDiv)
    }
    else if (recipients.includes(username)) {
      msgDiv.className = 'privateMsgReceived'
      document.getElementById('messages').appendChild(msgDiv)
    }
  }
})

function sendMessage() {
  let message = document.getElementById('msgBox').value.trim()
  if(message === '') return //do nothing
  if (clientConnected) {
    let tempArr = message.split(':')
    if (tempArr.length == 1) { // check if private message or not
      socket.emit('clientSays', username + ":" + message)
    }
    else {
      
      socket.emit('clientSaysPrivate', username + ":" + message) //this is for private message
    }
        
  }
  document.getElementById('msgBox').value = ''
}




function connectAsClient() {
  username = document.getElementById('usernameBox').value.trim()
  if(username === '') return //do nothing
  else {
    //Only user names that start with a letter and have only letters and numbers should be accepted as valid user names
    //Hence, if username have space-> not accepted
    if (username[0].match("^[a-zA-Z]+$") && username.match("^[A-Za-z0-9]+$")) {
      clientConnected = true
      //show an acknowledgement from the server when a client has successfully connected as a user.
      alert("You are connected to CHAT SERVER. YOU ARE: " + username)
    }
    document.getElementById('usernameBox').value = ''
  }
}

function clearScreen() { //clear current chat content on that user's page. The chat screens of other users should not be affected
  document.getElementById('messages').innerHTML = ''

}

function handleKeyDown(event) {
  const ENTER_KEY = 13 //keycode for enter key
  if (event.keyCode === ENTER_KEY) {
    sendMessage()
    return false //don't propogate event
  }
}

//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
  //This function is called after the browser has loaded the web page

  //add listener to buttons
  document.getElementById('send_button').addEventListener('click', sendMessage)
  document.getElementById('connect_as_button').addEventListener('click', connectAsClient)

  document.getElementById('clear_button').addEventListener('click', clearScreen)

  //add keyboard handler for the document as a whole, not separate elements.
  document.addEventListener('keydown', handleKeyDown)
  //document.addEventListener('keyup', handleKeyUp)
})

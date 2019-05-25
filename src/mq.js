

const connect = (client,lsh, cb)=>{
  // console.log('in connect')
  client.connect({
    onSuccess: (()=>{
      cb(client)
    }),
    onFailure: function (message) {
      console.log("Connection failed: " + message.errorMessage);
      //dmessage.innerHTML= "Connection failed: " + message.errorMessage;
    },
    useSSL: true,
    userName:lsh.email,
    password:lsh.token
  }); 
}
const monitorFocus=(window, client, lsh, cb)=>{
  window.onfocus = ()=>{
    if(!client.isConnected()){
      // console.log('focused')
      connect(client, lsh, (client)=>cb('focused-connected',client))
    }
  }
  window.onblur= ()=>{
    // console.log('unfocused')
    if(client.isConnected()){
      try{
        client.disconnect()
        cb('blur-disconnected', client)
      }catch(err){
        console.log(err)
      }
    }
  }
}

function req(client, devs, publish, topics){
  devs.map((dev)=>{
    topics.map((top, idx)=>publish(client, `${dev}/req`,`{"id":${idx},"req":"${top}"}`))
  })
}

function subscribe(client, devs, toparr){
  function subFailure(message){
    console.log('subscribe failure',message)
  }
  devs.map((dev)=>{
    toparr.map((top)=>client.subscribe(`${dev}/${top}` , {onFailure: subFailure}) )
  })
}

const setupSocket=(client, devs, publish, topics, cb)=>{
  const thedevs = Object.keys(devs)
  subscribe(client, thedevs, topics)
  req(client, thedevs, publish, topics )
  cb(devs, client)
}

export{connect, monitorFocus, subscribe, req, setupSocket}
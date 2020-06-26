

const fetchWeekSched = (ls, cfg, devid, senrel)=>{
  var lsh = ls.getItem()
  if(lsh){
    let url= cfg.url.api+'/admin/u/scheds/'+devid+'/'+senrel
    let options= {
      headers: {'Authorization': 'Bearer '+ lsh['token']},
      method: 'GET'
    }  
    return(
      fetch(url, options)
        .then((response)=>response.json())
    ) 
  }else{
    let p2 =Promise.resolve({qmessage:'you dont exist! '})
    return p2
  } 
}

const replaceWeekSched = (ls, cfg, keyvals)=>{
  console.log('in rplace')
  var lsh = ls.getItem()
  console.log('keyvals: ', keyvals)
  if(lsh){
    let url= cfg.url.api+'/admin/u/scheds'
    let options= {
      headers: {
        'Authorization': 'Bearer '+ lsh['token'],
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body:JSON.stringify(keyvals)
    }  
    return(
      fetch(url, options)
        .then((response)=>response.json())
    ) 
  }else{
    let p2 =Promise.resolve({qmessage:'you dont exist! '})
    return p2
  } 
}
const replaceZoneScheds = (ls, cfg, keyvals)=>{
  console.log('in rplace')
  var lsh = ls.getItem()
  console.log('keyvals: ', keyvals)
  if(lsh){
    let url= cfg.url.api+'/admin/u/zonescheds'
    let options= {
      headers: {
        'Authorization': 'Bearer '+ lsh['token'],
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body:JSON.stringify(keyvals)
    }  
    return(
      fetch(url, options)
        .then((response)=>response.json())
    ) 
  }else{
    let p2 =Promise.resolve({qmessage:'you dont exist! '})
    return p2
  } 
}

const fetchSched =(ls,cfg,devid,senrel,dow)=>{
  var lsh = ls.getItem()
  if(lsh){
    let url= `${cfg.url.api}/admin/u/unhold/${devid}/${senrel}/${dow}`
    let options= {
      headers: {
        'Authorization': 'Bearer '+ lsh['token'],
        'Content-Type': 'application/json'
      },
      method: 'GET'
    }  
    return(
      fetch(url, options)
        .then((response)=>response.json())
    ) 
  }else{
    let p2 =Promise.resolve({qmessage:'you dont exist! '})
    return p2
  }
}

const deleteHolds = (ls,cfg, ds)=>{
  var lsh = ls.getItem()
  if(lsh){
    let url= cfg.url.api+'/admin/u/holds'
    let options= {
      headers: {
        'Authorization': 'Bearer '+ lsh['token'],
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
      body:JSON.stringify(ds)
    }  
    return(
      fetch(url, options)
        .then((response)=>response.json())
    ) 
  }else{
    let p2 =Promise.resolve({qmessage:'you dont exist! '})
    return p2
  }
}

const replaceHold = (ls,cfg, db)=>{
  var lsh = ls.getItem()
  if(lsh){
    let url= cfg.url.api+'/admin/u/hold'
    let options= {
      headers: {
        'Authorization': 'Bearer '+ lsh['token'],
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body:JSON.stringify(db)
    }  
    return(
      fetch(url, options)
        .then((response)=>response.json())
    ) 
  }else{
    let p2 =Promise.resolve({qmessage:'you dont exist! '})
    return p2
  }
}

const fetchBigData = (ls,cfg, db)=>{
  var lsh = ls.getItem()
  if(lsh){
    let url= cfg.url.api+'/admin/u/bigdata'
    let options= {
      headers: {
        'Authorization': 'Bearer '+ lsh['token'],
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body:JSON.stringify(db)
    }  
    return(
      fetch(url, options)
        .then((response)=>response.json())
    ) 
  }else{
    let p2 =Promise.resolve({qmessage:'you dont exist! '})
    return p2
  }
}

export{fetchWeekSched, replaceWeekSched, replaceZoneScheds,fetchSched, replaceHold, deleteHolds, fetchBigData}
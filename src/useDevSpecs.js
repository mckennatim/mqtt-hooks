import { useEffect, useState} from "react";
import {connect } from './index'

const geta=(dotstr, obj)=>{
  return dotstr.split(".")
    .slice(1)
    .reduce((xs,x)=>(xs && xs[x]) ? xs[x] : null , obj)
}

export function useDevSpecs(ls,cfg, client,cb ){
  var lsh = ls.getItem()
  const [zones ,setZones] = useState({});
  const [binfo ,setBinfo] = useState({});
  const [devs,setDevs] = useState(undefined) 
  const fetchDevZones=()=>{
    
    if(geta('lsh.token', lsh)){
      let url= cfg.url.api+'/admin/i/devzones'
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
  useEffect(() => {
    console.log('running useEFect in useDevSpecs')
    let didCancel=false
    if(!didCancel){
      fetchDevZones().then((data)=>{
        setZones(data.zones)
        console.log('specs: ', data)
        console.log('str: ', JSON.stringify(data, null, 4 ))
        //const devs = Object.keys(data.devs)
        setDevs(data.devs)
        setBinfo(data.binfo)
        connect(client, lsh, ()=>cb(client,data.devs)) 
      })
    }
    return ()=>{
      didCancel=true
      client.disconnect()
    }
  }, []); 
  return {devs, zones, binfo} 
}



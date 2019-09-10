const getNow=(tzd_tza)=>{
  const d = new Date()
  let hr = d.getHours()*1+tzd_tza
  let min = d.getMinutes()*1
  hr = hr>=24 ? 23 : hr
  hr = hr<0 ? 24+hr : hr
  return [hr, min]
}

const startWhen = (tzdif, delay )=> {
  let [hr, min ]= getNow(tzdif)
  const de = delay ? delay.split(':') : [0,0]
  hr += de[0]*1
  min += de[1]*1
  if (min>=60){min=min-60; hr=hr+1;}
  if (hr>=24){hr=23; min = 59}
  hr = hr<1 ? 24+hr : hr
  return [hr, min]
}

const endWhen = (start, dur)=>{
  const add = dur.split(':')
  let min = start[1]+add[1]*1
  let hr = start[0]+add[0]*1
  if(min>60) {min-=60; hr+=1}
  if(hr>=24) {hr=23; min=59}
  return [hr, min]
}

const m2hm =(dur)=>{
  const decmin = Math.floor((dur % 1)*60)
  const hrs= Math.floor(dur/60)
  const min= dur - hrs*60 + decmin
  return `${hrs}:${min}`
}

const m2ms=(dur)=>{
  const sec = Math.floor(((dur/60) % 1)*60)
  const min = Math.floor(dur/60)
  return `${min}:${sec}`
}

const arrEqual = (arr1, arr2)=>{
  const ae = arr1.reduce((acc, a1, idx)=>a1==arr2[idx] ? acc+1 : acc+0 ,0)
  return ae==arr1.length ? 1 : 0
}

const hm2m =(hm)=>hm[0]*60+hm[1]*1

const last = (arr)=>arr[arr.length-1]

const newInterval = (starttime, startval, endtime, endval)=>{
  const st = starttime.concat(startval)
  const en = endtime.concat(endval)
  return [st, en]
}

const add2sched =  (osched, nintvl, tzd_tza)=>{
  //console.log('sched: ', JSON.stringify(sched))
  let i=0
  let now= getNow(tzd_tza)
  //console.log('getNow(tzd_tza): ', getNow(tzd_tza))
  const sched = osched.slice()
  const newsched = sched.reduce((acc, cur, idx)=>{
    //console.log('cur: ', JSON.stringify(cur))
    if(i==0){
      /*bump til now */
      if (hm2m(cur)<=hm2m(last(acc))){
        acc.push(acc.pop().slice(0,2).concat(cur.slice(2)))
      }else {i=1}
      /*if we are at end of sched */
      if (idx==sched.length-1){
        i=2
      }
    } 
    if (i==1){
      /*push til start */
      if (cur.length<3 || hm2m(cur)<hm2m(nintvl[0])){
        acc.push(cur)
      }else if(hm2m(cur)==hm2m(nintvl[0])){
        acc.pop()
        acc.push(nintvl[0])
      } 
      else {i=2}
      console.log('acc: ', JSON.stringify(acc))
      /*if we are at end of sched go add interval*/
      if (sched.length >1 && idx==sched.length-1){
        i=2
      }
    } 
    if(i==2){
      /*push interval */
      //console.log('acc: ', JSON.stringify(acc))
      //console.log('last, nintvl[0]: ',hm2m(last(acc)) , hm2m(nintvl[0]))
      if(hm2m(last(acc)) == hm2m(nintvl[0])){
        acc.pop()
        //console.log('popped acc: ', JSON.stringify(acc))
      }
      if(last(acc) && arrEqual(last(acc).slice(2),nintvl[0].slice(2))){
        /*if start action same */
        acc.push(nintvl[1])
      }else{
        //console.log('should push both')
        acc.push(nintvl[0])
        acc.push(nintvl[1])
        //console.log('acc: ', JSON.stringify(acc))
      }
      i=3
      /*if we are at end of sched go add interval*/
      if (sched.length >1 && idx==sched.length-1){
        i=4
      }
    }
    if (i==3){
      //console.log('in case 3')
      /*skip til end of interval */ 
      if(hm2m(cur)>hm2m(nintvl[1])) {
        i=4
      }
      /*if we are at end of sched go add the rest*/
      if (sched.length >1 && idx==sched.length-1){
        i=4
      }
      //console.log('cur: ', cur)
    }if (i==4){
      //console.log('in case 4')
      /*if end action is same as next get rid of it*/
      if(arrEqual(nintvl[1].slice(2), cur.slice(2))){
        acc = acc.concat(sched.slice(idx+1))
      }else {
        /*push the rest */
        //console.log('acc: ', JSON.stringify(acc))
        //console.log('sched.slice(idx): ', JSON.stringify(sched.slice(idx)))
        acc = acc.concat(sched.slice(idx))
        //console.log('acc: ', JSON.stringify(acc))
      }
      i=5
    }
    //console.log('acc: ', JSON.stringify(acc))
    return acc
  }, [now])
  return newsched
}



export{startWhen, endWhen, newInterval, add2sched, m2hm, m2ms, getNow}


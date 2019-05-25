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
  const hrs= Math.floor(dur/60)
  const min= dur - hrs*60
  return `${hrs}:${min}`
}

const hm2m =(hm)=>hm[0]*60+hm[1]*1

const last = (arr)=>arr[arr.length-1]

const newInterval = (starttime, startval, endtime, endval)=>{
  const st = starttime.concat(startval)
  const en = endtime.concat(endval)
  return [st, en]
}

const add2sched = (sched, nintvl, tzd_tza)=>{
  let i = 0
  let [hr, min ]= getNow(tzd_tza)
  console.log('getNow(tzd_tza): ', getNow(tzd_tza))
  const newsched = sched.reduce((acc, intvl, idx)=>{
    if(i==0){/*before the start of the new interval is processed */
      if(hm2m(intvl)<hm2m(last(acc))){
        acc.push(acc.pop().slice(0,2).concat(intvl.slice(2)))
          /*takes the first 2 entries of  the sched entry as minutes. If sched entry is less than now at init or last(acc) then it pop/push replaces the value. It keeps doing that (replacing the value) until it reaches a sched entry that is later than the last(acc)  */        
      }else if(hm2m(intvl)>hm2m(last(acc))){
        /* if the current sched entry is for later than the last(acc) */
        if(hm2m(last(acc)) === hm2m(nintvl[i])){
          /*check if new entry[0??] time happens to equal last(acc)'s*/
          acc.push(acc.pop().slice(0,2).concat(nintvl[i].slice(2)))
        }else{
          /*push on to acc the start entry of the new interval  */
          acc.push(nintvl[0])
        }
        i+=1 /*the first entry is now inserted, on to the second */
      }
      if(sched.length==1){i+=1} /*if sched like [[0,0,1]] then add the end entry */ 
    }
    if( i==1){/*add end of interval after the start of the interval is added */
      acc.push(nintvl[1])
      i+=1
    } 
    if(i==2){/*process the remainder of the sched */
      if(hm2m(intvl) > hm2m(nintvl[1])){/*once you have reduced past the end of the new interval add the remainder of the sched to acc*/
        const acctot = acc.concat(sched.slice(idx))
        i+=1 /*once i=3, the rest of the iterations through the sched are ignored */
        return acctot
      }
    }
    return acc
  }, [[hr, min]])
  return newsched
}

export{startWhen, endWhen, newInterval, add2sched, m2hm}


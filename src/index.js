import ProviderLib from "./provider";
import { processMessage as processMessageLib } from "./processMessage";
import { useDevSpecs as useDevSpecsLib} from './useDevSpecs'
import {Context}from './context'
import {connect, monitorFocus, subscribe, req, setupSocket } from './mq'
import {startWhen, endWhen, newInterval, add2sched, m2hm, m2ms, getNow, setRelayStatus, whereInSched, hma2time} from './utility'
import{fetchWeekSched, replaceWeekSched, replaceZoneScheds,replaceHold,fetchSched, deleteHolds, fetchBigData}from './fetches'

const getZinfo=(label,zones)=>zones.find((zone)=>zone.id==label)

const getDinfo=(label, devs)=>{
  let found = {}
  Object.keys(devs).map((dev)=>{
    devs[dev].map((a)=>{
      if(a.label==label){
        found.dev = dev
        found.sr = a.sr
        found.label= a.label
        return found
      }
    })
  })
  return found
}

export const ClientSocket = ProviderLib;
export const processMessage = processMessageLib;
export const useDevSpecs = useDevSpecsLib
export {Context, connect, monitorFocus,getZinfo, getDinfo, subscribe, req, setupSocket, startWhen, endWhen, newInterval, add2sched, m2hm, m2ms, getNow, setRelayStatus, whereInSched, hma2time, fetchWeekSched, replaceWeekSched, replaceZoneScheds, replaceHold, fetchSched, deleteHolds, fetchBigData}
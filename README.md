# @mckenna.tim/react-mqtt
 

A custom package used by https://sitebuilt.net/qr/ to add Context provider and hooks to react apps that connect to esp8266 and esp32 based sensor/relays/timers. Applications can use any subset of sensors, relays and timers from one or more devices. Talks to both mqtt broker and to server providing application configuration and authentication.

## Usage

    npm install @mckennatim/react-hooks

    import {ClientSocket, 
      Context, 
      useDevSpecs,  
      processMessage, 
      getZinfo,
      getDinfo, 
      setupSocket,
      monitorFocus
    } from '@mckennatim/react-hooks'  

Typically an app (like the prototype app `Cascada`) that uses `mqtt-hooks` 

* imports `ClientSocket` in a top level component like `<App/>`  
* imports `{  connect, Context, useDevSpecs,  processMessage, getZinfo,getDinfo ,setupSocket, monitorFocus}` into the control component (like `Control`) that connects whenever it is loaded, gets all the static app and device data from the database, parses it, processes messages for dispatch to components down line and sets up publish ability.
* imports `{startWhen, endWhen, newInterval, add2sched, m2hm, m2ms}` utlity functions for components that need to put things in the right format to publish to `mqtt` (like `Pond` and `Spot`)

During testing be sure to change between local and npm imports everywhere at once. In `Cascada` that is in `App`, `Control`, `Pond` and `Spot` (`SchedMod`(deprecated))

###  ClientSocket
ClientSocket is used to wrap any component+children that need client and/or publish objects. (The client is not connected at this point)

      <ClientSocket cfg={cfg}>
        <App />
      </ClientSocket>   

where cfg is of the form and connects you to the mqtt broker

    {cfg.mqtt_server, cfg.mqtt_port, cfg.appid}

example 

    "appid": "greenhouse",
    "mqtt_server": "services.sitebuilt.net/iotb/wss"
		"mqtt_port": 4333,

ClientSocket returns Context.Provider with client from a `new Paho.Client` and publish from a `new Paho.Message`

      <Context.Provider value={[this.client, this.publish]}>
        {this.props.children}
      </Context.Provider>    

### Context
Context provides a way to access `client` and `publish` form the react builtin `useContext` hook

    const [client, publish] = useContext(Context);

All it is is what you get back from react's builtin  `createContext`

    import { createContext } from "react";
    export const Context = createContext();
### useDevSpec

`useDevSpec` uses the `useEffect` hook to fetch [one time] information from the server about the devices and zones and binfo for the application at a particular address with a particular owner. This is set inside a token stored in local storage placed there by the authentication/authorization app https://iot.sitebuilt.net/v3/signin/

    const {devs, zones, binfo}= useDevSpecs(ls, cfg, client, (client, devs)=>{
      setupSocket(client, devs, publish, topics, (devs, client)=>doOtherShit(devs, client))
    })

dvs and zones binfo are in the form

devs

    {
      "CYURD004": [
        {
          "sr": 0,
          "label": "temp_gh"
        },
        {
          "sr": 1,
          "label": "hum_gh"
        },
        {
          "sr": 2,
          "label": "light_gh"
        }
      ],
      "CYURD006": [
        {
          "sr": 0,
          "label": "temp_out"
        }
      ]
    }
zones

    [
        {
            "id": "temp_gh",
            "name": "Greenhouse Temperature",
            "img": "temp_gh.jpg"
        },
        {
            "id": "hum_gh",
            "name": "Greenhouse Humidity",
            "img": "hum_gh.jpg"
        },
        {
            "id": "light_gh",
            "name": "Greenhouse Lights",
            "img": "light_gh.jpg"
        },
        {
            "id": "temp_out",
            "name": "Outside Temperature",
            "img": "temp_out.jpg"
        }
    ]
    binfo

    {
        "auth": true,
        "message": "user has apps",
        "email": "tim@sitebuilt.net",
        "app": "greenhouse",
        "loc": "12ParleyVale",
        "role": "user"
    }

Zones are set up by the original app author and it is a list of the things this app needs to function.  Devs are set up by the app installer or owner for a particular location and connects the id's of the things the app needs to the devices and sensors/relays/timers/schedules that the device has to offer.

#### the parameters (ls, cfg and client)
`ls` connects you to the localStorage key that corresponds to `cfg.appid`. It provides a `getItem()` function that allows access to the token inside the localstorage value string.  That token is sent inside a fetch to the server `cfg.url.api` . `client` is along for the ride so it can be connected to.

    headers: {'Authorization': 'Bearer '+ lsh['token']},

#### what else useDevSpec does

Still within the `useEffect` hook, `useDevSpec` uses the `useState` hook once `useDevSpec` fetches the data from the server. The  `useState` hooks sets the state of `devs`, `zones`  and `binfo`. The last thing to get done within the `useEffect` is to connect the client to the mqtt broker and return as a way to shut it down if the component dismounts 

    return ()=>{
      didCancel=true
      client.disconnect()
    }

In connecting to the mqtt broker, `useDevZones` sends the token from local storage as the connect 'password'. This only lets authorized users connect. In addition the broker uses the information in the token to determine which topics the user can subscribe and publish to. 

## monitorFocus (optional)

`monitorFocus` is the other way to connect and disconnect from the mqtt client. it takes a `window` object and turns the client on and off depending on focus or blur in cases where cutting off network traffic can help allay  battery concerns.

## setupSocket 

Once you are connected, `setupSocket` runs. Carrying  `client`, `publish` and `devs` from `useDevSpecs` or `monitorFocus`, it also needs to know what `topics` you want to pay attention to. `['srstate', 'sched', 'flags', 'timr']` are most of them. Basically these are the small and efficient type of messages that esp8266 and esp32 devices can handle decoding and encoding using c++. iot.sitebuilt.net has designed them. 

`srstate` is sent whenever the sensor or relay value changes or if setpoints like hilimit or lolimit are changed. 

    CYURDOO4/srstate {"id":0, "darr":[64, 1, 81, 78], "new":0}

`sched` sends the schedule current running for a particular sesnor or relay. One of the devices built in timers is reserved for downloading the day's schedule from the mqtt broker->database at around midnight every day.
    
    CYURDOO4/sched {"id":2,"aid":2,"ev":3,"numdata":1,"pro":[[0,0,1],[7,45,0],[19,0,1]]}

`timr` sends and array of timeleft on all relays that are run by a timers. "IStIMERoN" and "ISrELAYoN" is a binary representation of which relays and timers are currently on.

    CYURD002/timr{"cREMENT":5,"IStIMERoN":4,"ISrELAYoN":5,"tIMElEFT":[0,0,26215,0,0]}

On every connection `setupSocket` subscribes to these topics and requests the current state of things. These subscriptions (and publishing rights too) are authorized at the mqtt broker using the token sent from `useDevZones` 

## processMessage

`processMessage` is called whenever the client.onMessageArrived calback fires. `processMessage` transforms the device/topic/payload data into and updated state for the zones the component is interested in. It returns a data package for that zone whenever the arriving message has anything to do with a zone you care about. Sometimes it returns `undefined` since the message has nothing to do with any zone you care about. `onMessageArrived` only updates the state of the zone that has new or changed data from `processMessage`

## getDinfo
`getDinfo` gets the device information doing a reverse lookup from zone to devices and relay that is providing the data to that zone. This allows you to `publish` to a `device/topic` `sr` or `id` (sensor/relay ids) to change things on the device.

## getZinfo
`getZinfo` gets the Zone information that you may want to use for displaying the pretty name of the zone or any iimages or other data that may be associated with that zone.

## utility functions
### startWhen(tzd_tza, delay)

When modify the days schedule of a device, you may be doing so from a different timezone. `startWhen(tzd_tza, delay)` takes browser time used by the app and transforms it to the current time as seen at the device. Timezones are sometimes expressed something like `Fri May 24 2019 16:53:07 GMT-0400 (Eastern Daylight Time)` where `GMT-0400` is a representation of timezone modified by Day Light Savings Time, `txd_tza` uses that representation expressed as  `device_location_tz - app(browser)_location_tz`. The second parameter is optional and would delay the start of the modified schedule. startWhen returns a time as an array `[hr, min]` like `[17, 45]`

### endWhen(starttime, dur)

`endWhen(starttime, dur)` takes a starttime in the form returned by `startWhen` and outputs an end time in the same format calculated using duration in the format `'1:15'`, returning a end time that is an hour and fifteen minutes later

### newInterval(starttime, startval, endtime, endval)

In modifying a schedule you will be inserting into that schedule a new interval. The format used by the iot devices varies. An example of the simplest form is `[[9,20,1], [13,15,0]]` which would turn a relay on at 9:20am and off at 1:15pm. An example of a change to a sensor controlled relay would be `[[17,15,72,70], [22,30,61,59]]` which might do something like change the setpiont of a thermostat from ~71 degrees at 5:15pm and then lower the thermostat to ~60 degrees at 10:30pm. Here the relay calling for heat is controlled by the thermostat.

### add2sched(sched, newInterval, tzd_tza)

`add2sched` modifies a schedule by inserting a new interval into it. The existing day's schedule is modified. Schedule events that have already happened are ignored. The new schedule that is returned starts from the moment you send it (although the new interval might not start rigth away, it might be delayed). Once the new interval completes then the remainder of the existing schedule will execute.

### m2hm(min)

`m2hm(min)` takes a number and returns a string like `'hr:min'`

## refs
https://medium.com/@TeeFouad/a-simple-guide-to-publishing-an-npm-package-506dd7f3c47a
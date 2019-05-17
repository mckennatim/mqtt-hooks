# @mckenna.tim/react-mqtt


A custom package to add Context provider and hooks to react apps that connect to esp8266 and esp32 based sensor/relays/timers. Applications can use any subset of sensors, relays and timers from one or more devices. Talks to both mqtt broker and to server providing application configuration and authentication.

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

###  ClientSocket
ClientSocket returns Context.Provider with client from a `new Paho.Client` and publish from a `new Paho.Message`

      <Context.Provider value={[this.client, this.publish]}>
        {this.props.children}
      </Context.Provider>

ClientSocket is used to wrap any component that needs client and/or publish objects. (The client is not connected at this point)

      <ClientSocket cfg={cfg}>
        <Twitter />
      </ClientSocket>   

where cfg is of the form and connects you to the mqtt broker

    {cfg.mqtt_server, cfg.mqtt_port, cfg.appid}

example 

    "appid": "greenhouse",
    "mqtt_server": "services.sitebuilt.net/iotb/wss"
		"mqtt_port": 4333,

### Context
Context provides a way to access `client` and `publish`

        const [client, publish] = useContext(Context);

### useDevSpec

`useDevSpec` uses the `useEffect` hook to fetch [one time] information from the server about the devices and zones for the application at a particular address with a particular owner. This is set inside a token stored in local storage placed there by the authentication/authorization app https://iot.sitebuilt.net/v3/signin/

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

Still within the `useEffect` hook, `useDevSpec` uses the `useState` hook once `useDevSpec` fetches the data from the server. The  `useState` hooks sets the state of `devs`, `zones`  and `binfo`. The last thing to get done within the `useEffect` is to connect the client to the mqtt broker and return  way to shut it down if the component dismounts 

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

On every connection `setupSocket` subscribes to these topics and requests the current state of things. These subscriptions (and publishing rigths too) are authorized at the mqtt broker using the token sent from `useDevZones` 

## processMessage

`processMessage` is called whenever the client.onMessageArrived calback fires. `processMessage` transforms the device/topic/payload data into and updated state for the zones the component is interested in. It returns a data package for that zone whenever the arriving message has anything to do with a zone you care about. Sometimes it returns `undefined` since the message has nothing to do with any zone you care about. `onMessageArrived` only updates the state of the zone that has new or changed data from `processMessage`

## getDinfo
`getDinfo` gets the device information doing a reverse lookup from zone to devices and relay that is providing the data to that zone. This allows you to `publish` to a `device/topic` `sr` or `id` (sensor/relay ids) to change things on the device.

## getZinfo
`getZinfo` gets the Zone information that you may want to use for displaying the pretty name of the zone or any iimages or other data that may be associated with that zone.
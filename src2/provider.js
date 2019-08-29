import React, { Component } from "react";
import { Context } from "./context";
var Paho = require('paho.mqtt.js')

export default class Provider extends Component {
  constructor(props) {
    super(props);
    const {cfg}=this.props 
    this.client = new Paho.Client(cfg.mqtt_server, cfg.mqtt_port, cfg.appid+Math.random())
    this.client.onConnectionLost=(responseObject)=> {
      if (responseObject.errorCode !== 0) {
        console.log('Connection Lost ' + responseObject.errorMessage);
      }
    }
  }

  publish =(client, topic, payload)=>{
    var message = new Paho.Message(payload);
    message.destinationName = topic;
    client.send(message)
  }

  render() {
    return (
      <Context.Provider value={[this.client, this.publish]}>
        {this.props.children}
      </Context.Provider>
    );
  }
}
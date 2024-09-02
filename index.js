const net = require('node:net');
const util = require("util");
const utilities = require ('../utilities-sk/utilities.js')
const { resolve } = require('node:path');
module.exports = (app) => {
  var intervalID
  
  function createPath(path, type, description=''){

    app.handleMessage(plugin.id, 
      {
       updates: [{ meta: [{path: path, 
        value: { units: type, 
        description:description }}]}]
      }
    );

  }
  function updatePath(path, value){
    app.handleMessage(plugin.id, {updates: [ { values: [ {path: path, value: value }] } ] })
    
  }
  
    const plugin = {
      raiseAlarm: (settings)=>{
        updatePath('notifications.'+settings.ac_state_path, 
          {state:"alert",method:[],
           message:`AC Outlet at ${settings.ac_outlet_host}:${settings.ac_outlet_port} not responding` 
        })
      },
      clearAlarm: (settings)=>{
        updatePath('notifications.'+settings.ac_state_path, 
          {state:"normal", method:[],
           message:`AC Outlet at ${settings.ac_outlet_host}:${settings.ac_outlet_port} responding again.` 
        })
      },
      id: 'ping-ac-outlet-plugin',
      name: 'Ping AC outlet',
      state: -1,
      start: (settings, restartPlugin) => {
        app.debug("Starting PING AC Outlet: "+ settings.ac_state_path)

        createPath(settings.ac_state_path, "number")
        updatePath(settings.ac_state_path, plugin.state)

        intervalID = setInterval( () =>{

          const socket = new net.Socket()
          socket.connect(80, settings.ac_outlet_host).on("connect", () => {
            updatePath(settings.ac_state_path, 1);
            if (plugin.state==0) 
              plugin.clearAlarm(settings);
            plugin.state=1
            socket.destroy();
          })
          .on("error", (err) => {
            if (err.code == 'ECONNREFUSED') { //-111 Refused but the IP address is still online so there's power
                            
                updatePath(settings.ac_state_path, 1);
                if (plugin.state==0) 
                  plugin.clearAlarm(settings);
                plugin.state=1
              }
              else if (err.code == 'EHOSTUNREACH') { //-113 Very likely because there's no power to the outlet
                updatePath(settings.ac_state_path, 0);
                if (plugin.state==1) 
                  plugin.raiseAlarm(settings) //raiseAlarm
                plugin.state=0
              }
              socket.destroy();
            })

        }, settings.check_interval*1000);
       
      },
      stop: () => {
        if (intervalID!=null){
          clearInterval(intervalID)
        }
      },
    };
    plugin.schema = {
        type: 'object',
        required: ['smtp_host', 'smtp_port', 'ac_outlet_host','check_interval', 'ac_state_path'],
        properties: {
          ac_outlet_host: {
                type: 'string',
                title: 'Host name of AC Outlet host to ping (e.g. 192.168.2.50)',
                default: "192.168.xxx.xxx"
          },
          ac_outlet_port:{
            type:'number',
            title: 'Port of AC Outlet host',
            default:80
          },
          check_interval:{
            type:"number",
            title: "Interval between pings (in seconds)",
            default: 60
          },
          ac_state_path:{
            type:'string',
            title:'Signalk path that reflects state of AC outlets',
            default: 'electrical.ac.state'
          },
        }
      };
//    plugin.getOpenApi = () => openapi;

    return plugin;
  };




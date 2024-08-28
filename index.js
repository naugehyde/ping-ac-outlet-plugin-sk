const nodemailer=require('nodemailer')
const net = require('node:net');
const util = require("util");
const { resolve } = require('node:path');
const regex = /\$\{(.*?)\}/g  

module.exports = (app) => {
  var intervalID

// async..await is not allowed in global scope, must use a wrapper
async function sendAlertEmail(transporter, settings) {
  // send mail with defined transport object
  const body = eval("\`"+settings.alert_text.replace(regex,"${app.getSelfPath('$1')}")+"\`")
  const subject = eval("\`"+settings.alert_text.replace(regex,"${app.getSelfPath('$1')}")+"\`")

  const info = await transporter.sendMail({
    from: settings.smtp_user, // sender address
    to: settings.recipients, // list of receivers
    subject: subject,
    text: body, // plain text body
    html: "<b>"+body+"</b>", // html body
  });
  return info
}

async function sendRestoredEmail(transporter, settings) {
  // send mail with defined transport object

  const body = eval("\`"+settings.restored_text.replace(regex,"${app.getSelfPath('$1')}")+"\`")
  const subject = eval("\`"+settings.restored_text.replace(regex,"${app.getSelfPath('$1')}")+"\`")

  const info = await transporter.sendMail({
    from: settings.smtp_user, // sender address
    to: settings.recipients, // list of receivers
    subject: subject, // Subject line
    text: body, // plain text body
    html: "<b>"+body+"</b>", // html body
  });
  return info
  }

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
      id: 'ping-ac-outlet-plugin',
      name: 'Ping AC outlet',
      state: -1,
      start: (settings, restartPlugin) => {
         const transporter = nodemailer.createTransport({
          host: settings.smtp_host,
          port: settings.smtp_port,
          secure: settings.smtp_port==465, // Use `true` for port 465, `false` for all other ports
          auth: {
            user: settings.smtp_user,
            pass: settings.smtp_password,
          },
        });
        app.debug("Starting PING AC Outlet: "+ settings.ac_state_path)

        createPath(settings.ac_state_path, "number")
        updatePath(settings.ac_state_path, plugin.state)
        intervalID = setInterval( () =>{
          
          const socket = new net.Socket()
          socket.connect(80, settings.ac_outlet_host).on("connect", () => {
            updatePath(settings.ac_state_path, 1);
            if (plugin.state==0)
                sendRestoredEmail(transporter, settings)
              plugin.state=1
              socket.destroy();
          })
          .on("error", (err) => {
            if (err.code == 'ECONNREFUSED') { //-111 Refused but the IP address is still online so there's power
                updatePath(settings.ac_state_path, 1);
                if (plugin.state==0) 
                  sendRestoredEmail(transporter, settings)
                plugin.state=1
              }
              else if (err.code == 'EHOSTUNREACH') { //-113 Very likely because there's no power to the outlet
                if (plugin.state==1) 
                  sendAlertEmail(transporter, settings)
                updatePath(settings.ac_state_path, 0);
                plugin.state=0
              }
              socket.destroy();
            })
      
   
        }, settings.check_interval*1000) 
      },
      stop: () => {
        if (intervalID!=null){
          clearInterval(intervalID)
        }
        // shutdown code goes here.
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
            title: "Interval between pings"
          },
          ac_state_path:{
            type:'string',
            title:'Signalk path that reflects state of AC outlets',
            default: 'electrical.ac.state'
          },
          smtp_host: {
            type: 'string',
            title: 'SMTP Host for sending email warning (e.g.: smtp.gmail.com)'
          },
          smtp_port: {
            type: 'number',
            title: 'SMTP Port (e.g.: 465 for secure, 587  for insecure)',
            default: 465
          },
          smtp_user:{
            type: 'string',
            title: 'SMTP user ID'
          },
          smtp_password:{
            type:'string',
            title: 'SMTP user password'
          },
          recipients: {
            type: 'string',
            title:'Recipient(s) of power off warning email'
          },
          alert_text:{
            type: 'string',
            title: 'Text to send when power is down use ${name} for boat name. (Will work for any SK path)',
            default: 'Shore power appears to be off on ${name}.'
          },
          alert_subject:{
            type: 'string',
            title: 'Subject of email when power is down',
            default: 'ALERT Shore power appears to be off on ${name}.'
          },
          restored_text:{
            type: 'string',
            title: 'Text to send when power is down use ${name} for boat name. (Will work for any SK path)',
            default: 'Shore power has been restored on ${name}.'
          },
          restored_subject:{
            type: 'string',
            title: 'Subject of email when power is restored',
            default: 'ALERT Shore power restored on ${name}.'
          },

        }
      };
    return plugin;
  };




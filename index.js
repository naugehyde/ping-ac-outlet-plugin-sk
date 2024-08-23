const nodemailer=require('nodemailer')
const net = require('node:net');
const util = require("util");
  

module.exports = (app) => {
  var intervalID
  var state 

// async..await is not allowed in global scope, must use a wrapper
async function sendAlertEmail(transporter, settings) {
  // send mail with defined transport object
  const body = `AC Power plug not responding on ${app.getSelfPath('name')}. Shore power appears to be off.`
  const info = await transporter.sendMail({
    from: settings.smtp_user, // sender address
    to: settings.recipients, // list of receivers
    subject: `ALERT from ${app.getSelfPath('name')}: Shore Power appears to be off`, // Subject line
    text: body, // plain text body
    html: "<b>"+body+"</b>", // html body
  });
}

// async..await is not allowed in global scope, must use a wrapper
async function sendRestoredEmail(transporter, settings) {
  // send mail with defined transport object
  const body = `AC Power restored on ${app.getSelfPath('name')}`
  const info = await transporter.sendMail({
    from: settings.smtp_user, // sender address
    to: settings.recipients, // list of receivers
    subject: `ALERT from ${app.getSelfPath('name')}: Shore power restored`, // Subject line
    text: body, // plain text body
    html: "<b>"+body+"</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
}

  function pingOutlet(host, path){
  
    try {
      const socket = new net.Socket()
      socket.connect(80,host).on("error", (err) => {
        if (err.code=='ECONNREFUSED'){ //-111
          updatePath(path,1)
          return 1
        } else  {
          if (err.code=='EHOSTUNREACH') //-113
            updatePath(path,0)
            return 0
        }
      })
    } catch (error) {
      updatePath(path,-1)
      app.debug(util.inspect(error))

    }
  }


  function createPath(path, type){

    app.handleMessage(plugin.id, 
      {
       updates: [{ meta: [{path: path, 
                          value: { units: type, 
                          description:'' }}]}]
      }
    );

  }
  function updatePath(path, value){
    app.handleMessage(plugin.id, {updates: [ { values: [ {path: path, value: value }] } ] })
    
  }
    const plugin = {
      id: 'ping-ac-outlet-plugin',
      name: 'Ping AC outlet',
      start: (settings, restartPlugin) => {
         const transporter = nodemailer.createTransport({
          host: settings.smtp_host,
          port: settings.smtp_port,
          secure: true, // Use `true` for port 465, `false` for all other ports
          auth: {
            user: settings.smtp_user,
            pass: settings.smtp_password,
          },
        });
        app.debug("Starting PING AC Outlet: "+ settings.ac_state_path)
        //sendAlertEmail( transporter, settings)
        //sendRestoredEmail( transporter, settings)
        createPath(settings.ac_state_path, "number")
        updatePath(settings.ac_state_path, -1)
        intervalID = setInterval( () =>{
          const ping = pingOutlet(settings.ac_outlet_host,settings.ac_state_path)
          if (ping==0 && state!=0)
            sendAlertEmail( transporter, settings)
          else if (ping==1 && state==0)
            sendRestoredEmail(transporter, settings)
          state=ping
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
          }
        }
      };
    return plugin;
  };




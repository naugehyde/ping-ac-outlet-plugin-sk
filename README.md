# Ping AC Outlet Plugin for Signalk (www.signalk.org)

## What it is

This is a simple plugin for Signalk that with one piece of inexpensive hardware will monitor the AC status on your boat and send an alert via email if the AC appears to be down.<br>

I say "appears" because the plugin relies on indirect information (the accessibility of a particular local area network address) to determine the AC status.<br> 

With a properly configured plugin and a properly configured Wifi-enabled AC outlet plug, the plugin is unlikely to produce false positives (AC shows off when it's on) and for the life of me I can't think of a situation (apart from sabotage) where it'd produce a false negative (AC shows on when it's off).

## Who is it for

Shore power outage can occur during severe weather and can drain your batteries if there's a DC load anywhere on your system. Mariners like myself keep our NMEA 2000 and Signalk systems running 24/7. At times, I'll run a heavy DC load like my boat's refrigerator when I'm ashore. <br>
<br>
If your boat is internetworked and Internet accessible and you're running DC loads that could drain your battery, this plugin is for you. <br>

## Prerequisites

1) Signalk<br>
2) Internet access with a router on a 12/24 volt system<br>
3) Access to an SMTP service like smtp.gmail.com<br>
4) A smart AC outlet plug like TP-Link KS-115. https://www.kasasmart.com/us/products/smart-plugs/kasa-smart-plug-slim-energy-monitoring-kp115. Note: any smart plug that's a client on your LAN with a known IP address should do. Let me know if there's one that doesn't work with this plugin.<br>

## Installation

### Signalk Appstore
This will be the recommended installation when the code is ready for wider sharing. In the meantime, use the platform-specific developer install instructions below.

### Linux
From a command prompt:<br>

<pre>  cd ~/[some_dir]
  git clone https://github.com/naugehyde/ping-ac-outlet-plugin-sk
  cd ping_ac_outlet_plugin_sk
  npm i
  [sudo] npm link
  cd [signalk_home] 
  npm link ping-ac-outlet-plugin-sk</pre>

Finally, restart SK. Plugin should appear in your server plugins list.<br>

> [!Tip] "~/.signalk" is the default signalk home on Linux. If you're 
> getting permissions errors executing npm link, try executing "npm link" under sudo.

### Windows
TBD

### OSX
TBD

### Configuration

Configuration is largely self-explanatory. Start by opening the Signalk->Server Plugin Config page.<br>

If you want to edit the body or subject text of the alert or restored email outside of the Signalk plugin config screen, edit \<signalk home\>/plugin_config_data/ping_ac_outlet_plugin_sk.json in a JSON editor or in any text editor just be sure to get your JSON syntax correct or the plugin won't load at SK startup.<br>

If you're using smtp.gmail.com (or a similar secure smtp service) for your mail sender, you'll need to create an app specific plaform for **nodemailer**, the nodejs mail sending client. See: https://support.google.com/accounts/answer/185833?hl=en<br>

## To Do

1) Further testing and documenting<br>
2) Publish to Signalk app store<br>
3) Investigate and implement a Signalk notification architecture for the plugin.<br>
4) Decouple nodemailer by creating plugin that offers an SK-API for mail sending

## Off-Label Use

In theory, this plug-in can be used to monitor the presence of any IP address on or off your network. Can't imagine what these applications might be, but have at it you rascal.<br>

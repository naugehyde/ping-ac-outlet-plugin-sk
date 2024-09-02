# Ping AC Outlet Plugin for [Signalk](www.signalk.org)

## What it is

This is a simple plugin for Signalk that with one piece of inexpensive hardware will raise an alert if the AC (shore power) on your boat appears to be unavailable<br>

I say "appears" because the plugin relies on indirect information (the accessibility of a particular local area network address) to determine the AC status.<br> 

With a properly configured plugin and a properly configured Wifi-enabled AC outlet plug, the plugin is unlikely to produce false positives (AC shows off when it's on) and for the life of me I can't think of a situation (apart from sabotage) where it'd produce a false negative (AC shows on when it's off).

The plugin raises an alert that can be responded by a Node-Red flow (or similar). If (as in my case) your boat has Internet access, the alert can then be emailed to you so you'll know when your boat has lost shore power.

## Who is it for

Shore power outage can occur during severe weather and can drain your batteries if there's a DC load anywhere on your system. Mariners like myself keep our NMEA 2000 and Signalk systems running 24/7. At times, I'll run a heavy DC load like my boat's refrigerator when I'm ashore. <br>
If you're running DC loads that could drain your battery, this plugin could save you time and money. <br>

## Prerequisites

1) Signalk<br>
3) A smart AC outlet plug like TP-Link KS-115. https://www.kasasmart.com/us/products/smart-plugs/kasa-smart-plug-slim-energy-monitoring-kp115. Note: any smart plug that's a client on your LAN with a known IP address should do. Let me know if there's one that doesn't work with this plugin.<br>

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

> NOTE "~/.signalk" is the default signalk home on Linux. If you're 
> getting permissions errors executing npm link, try executing "npm link" under sudo.

### Windows
TBD

### OSX
TBD

### Configuration

Configuration is largely self-explanatory. Start by opening the Signalk->Server Plugin Config page.<br>

## To Do

1) Further testing and documenting<br>
2) Publish to Signalk app store<br>

## Off-Label Use

In theory, this plug-in can be used to monitor the presence of any IP address on or off your network. Can't imagine what these applications might be, but have at it you rascal.<br>

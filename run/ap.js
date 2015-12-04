var fs = require('fs'),
verb=require('verbo'),
dnsMasq=require('../index');
var myDns=new dnsMasq({interface:'wlan0'});
myDns.setmode('ap');
verb(myDns)

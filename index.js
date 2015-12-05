var pathExists=require('path-exists'),
fs = require('fs'),
merge=require('json-add'),
exec=require('promised-exec'),
outputFileSync = require('output-file-sync');


function parsemasq(path,config){

  var write='';

  if(config.noresolv){
    write=write+'no-resolv\n'
  }

  if(config.dhcp){
    var root_address=config.host.split('.')[0]+'.'+config.host.split('.')[1]+'.'+config.host.split('.')[2]
    startIp=root_address+'.'+config.dhcp.start;
    stopIp=root_address+'.'+config.dhcp.stop;

    write=write+'dhcp-range='+startIp+','+stopIp+','+config.dhcp.lease+'\n'
  }

  if(config.interface){
    write=write+'interface='+config.interface+'\n'
  }

  if(config.dns){
    for(var c=0;c<config.dns.length;c++){
      write=write+'server='+config.dns[c]+'\n'
    }
  }
  if(config.address){
    write=write+'address='+config.address+'\n'
  }


outputFileSync(path, write, 'utf-8');
if(!config.test){
  return exec('systemctl restart dnsmasq');

} else{
  return exec('echo');

}



}

function dnsMasq(options){

  var config={
    path:'/etc/dnsmasq.conf',
    test:false,
    dhcp:{
      stop:10,
      start:3,
      lease:'3h'
    },
    mode:false,
    dns:['8.8.8.8','8.8.4.4'],
    host:"192.99.0.1"
  }

  if(options && typeof(options)=='object'){
    merge(config,options)
  }

  if(!pathExists.sync(config.path)){
    throw Error('No configuration file was founded')
  }

  if(config.host.split('.').length>4){
    throw Error('Wrong host')
  }

  if(!config.interface){
    throw Error('No configuration interface was provided')
  }

  for(var c=0;c<Object.keys(config).length;c++){
    this[Object.keys(config)[c]]=config[Object.keys(config)[c]];
  }

  this.modes={
    ap:{
      noresolv:true,
      dns:config.dns,
      dhcp:config.dhcp,
      host:config.host,
      test:config.test,
      interface:config.interface
    },
    link:{
      noresolv:true,
      dns:config.dns,
      test:config.test,
      dhcp:config.dhcp,
      interface:config.interface,
      host:config.host,
      address:'/#/'+config.host
    },
    host:{
      noresolv:true,
      dns:config.dns,
      test:config.test,
      dhcp:config.dhcp,
      host:config.host,
      interface:config.interface,
      address:'/#/'+config.host
    }
  }

};

dnsMasq.prototype.setmode=function(mode){

  this.mode=mode;

console.log(this.modes[mode])
  return parsemasq(this.path,this.modes[mode])


},
dnsMasq.prototype.ap=function(){

  this.mode='ap';
  return parsemasq(this.path,this.modes.ap)

},
dnsMasq.prototype.host=function(){

  this.mode='host';
  return parsemasq(this.path,this.modes.host)

},
dnsMasq.prototype.link=function(){

  this.mode='imperative';
  return parsemasq(this.path,this.modes.link)

};

module.exports=dnsMasq

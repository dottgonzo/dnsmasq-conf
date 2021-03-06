import * as pathExists from "path-exists";
var mocha = require('mocha'),
assert = require('chai').assert,
fs = require('fs'),
verb=require('verbo'),
DnsMasq=require('../index');
if(!pathExists.sync("/tmp/dnsmasq.conf")){
    fs.writeFileSync("/tmp/dnsmasq.conf","","utf-8")
}
var myDns=new DnsMasq({path:'/tmp/dnsmasq.conf',interface:'wlan0',test:true});

verb(myDns)

describe('config', function() {
  describe('check basic existence', function() {

  it('must return something', function() {
    assert.ok(myDns,'torna');
  });
});

describe('check if is an object', function() {

  it('must be an object', function() {

  assert.isObject(myDns, 'dns configuration is an object');
  });
});


});

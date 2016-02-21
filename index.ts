import * as pathExists from "path-exists";
import * as fs from "fs";
import merge = require("json-add");
let exec = require('promised-exec');
let outputFileSync = function(file:string,content:any){
    fs.writeFileSync(file,content)
}
interface ConfDnsm {
    path: string;
    interface: any;
    test: boolean;
    dhcp: {
        stop: number;
        start: number;
        lease: string;
    };
    mode?: string;
    dns: [string];
    hostIp: string;
}
interface OptDnsm {
    path?: string;
    interface: any;
    test?: boolean;
    mode?: string;
    dns?: [string];
    hostIp?: string;
}

interface Modes {
    ap: Mode;
    link: Mode;
    host: Mode
};

interface Mode {
    noresolv: boolean,
    dns: [string],
    dhcp: {
        stop: number;
        start: number;
        lease: string;
    };
    hostIp: string,
    test: boolean,
    interface: any,
    address?: string
}




declare let config: ConfDnsm
config = {
    path: '/etc/dnsmasq.conf',
    interface: false,
    test: false,
    dhcp: {
        stop: 10,
        start: 3,
        lease: '3h'
    },
    dns: ['8.8.8.8', '8.8.4.4'],
    hostIp: "192.99.0.1"
}



function parsemasq(path: string, config: Mode) {

    let write = '';

    if (config.noresolv) {
        write = write + 'no-resolv\n'
    }

    if (config.dhcp) {
        var root_address = config.hostIp.split('.')[0] + '.' + config.hostIp.split('.')[1] + '.' + config.hostIp.split('.')[2]
        let startIp = root_address + '.' + config.dhcp.start;
        let stopIp = root_address + '.' + config.dhcp.stop;

        write = write + 'dhcp-range=' + startIp + ',' + stopIp + ',' + config.dhcp.lease + '\n'
    }

    if (config.interface) {
        write = write + 'interface=' + config.interface + '\n'
    }

    if (config.dns) {
        for (var c = 0; c < config.dns.length; c++) {
            write = write + 'server=' + config.dns[c] + '\n'
        }
    }
    if (config.address) {
        write = write + 'address=' + config.address + '\n'
    }


    outputFileSync(path, write);
    if (!config.test) {
        return exec('systemctl restart dnsmasq');

    } else {
        return exec('echo');

    }



}




let DMasq = class DNSMasq implements ConfDnsm {
    modes: Modes;
    mode:string;
    path:string;
    

    interface: any;
    test: boolean;
    dhcp: {
        stop: number;
        start: number;
        lease: string;
    };

    dns: [string];
    hostIp: string;
    
    
    constructor(public options: OptDnsm) {

        if (options && typeof (options) == 'object') {
            merge(config, options)
        }

        if (!pathExists.sync(config.path)) {
            throw Error('No configuration file was founded')
        } 
        
        this.path=config.path;

        if (config.hostIp.split('.').length > 4) {
            throw Error('Wrong host')
        }

        if (!config.interface) {
            throw Error('No configuration interface was provided')
        }

        for (var c = 0; c < Object.keys(config).length; c++) {
            this[Object.keys(config)[c]] = config[Object.keys(config)[c]];
        }

        this.modes = {
            ap: {
                noresolv: true,
                dns: config.dns,
                dhcp: config.dhcp,
                hostIp: config.hostIp,
                test: config.test,
                interface: config.interface
            },
            link: {
                noresolv: true,
                dns: config.dns,
                test: config.test,
                dhcp: config.dhcp,
                interface: config.interface,
                hostIp: config.hostIp,
                address: '/#/' + config.hostIp
            },
            host: {
                noresolv: true,
                dns: config.dns,
                test: config.test,
                dhcp: config.dhcp,
                hostIp: config.hostIp,
                interface: config.interface,
                address: '/#/' + config.hostIp
            }
        }


    }


    setmode(mode:string) {

        this.mode = mode;

        console.log(this.modes[mode])
        return parsemasq(this.path, this.modes[mode])


    };
    ap() {

        this.mode = 'ap';
        return parsemasq(this.path, this.modes.ap)

    };
    host() {

        this.mode = 'host';
        return parsemasq(this.path, this.modes.host)

    };

    link() {

        this.mode = 'link';
        return parsemasq(this.path, this.modes.link)

    };


}


export = DMasq;

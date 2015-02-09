var MS5803 = require('./index.js');

var sensor = new MS5803({address: 0x76});

//sensor.scan();

sensor.reset();

sensor.getCalConstant(); 
sensor.read();


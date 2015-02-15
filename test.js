var MS5803 = require('./index.js');

var sensor = new MS5803({address: 0x76, device: '/dev/i2c-2'});

var data = {
        temp: 0,
        pressure: 0,
  };

//sensor.scan();

//sensor.reset();

//sensor.getCalConstant(); 
sensor.read(data);
  console.log(data);

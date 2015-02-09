# ms5803_rpi
MS5803-14BA water pressure/depth sensor for Raspberry PI

### Install

```
$ npm install ms5803_rpi
```

### Usage

```javascript
var ms5803 = require('ms5803_rpi');

var sensor = ms5803({address: 0x76});

sensor.read(function (err, data) {
  // data is { pressure: 1013.0 , temp: 68.9 }
});

```


var async = require('async');
var i2c = require('i2c');

function MS5803(options) {
  var wire = new i2c(options.address);

  var MS5803_RESET     	= 0x1E;
  var MS5803_PROM_BASE	= 0xA0;
  var MS5803_PROM_C1	= 0xA2;
  var MS5803_PROM_C2	= 0xA4;
  var MS5803_PROM_C3	= 0xA6;
  var MS5803_PROM_C4	= 0xA8;
  var MS5803_PROM_C5	= 0xAA;
  var MS5803_PROM_C6	= 0xAC;
  var MS5803_PROM_CRC	= 0xAE;
  var MS5803_ADC_READ	= 0x00;
 

  var MS5803_D1_256	= 0x40;
  var MS5803_D1_512	= 0x42;
  var MS5803_D1_1024 	= 0x44;
  var MS5803_D1_2048	= 0x46;
  var MS5803_D1_4096	= 0x48;
  var MS5803_D2_256	= 0x50;
  var MS5803_D2_512	= 0x52;
  var MS5803_D2_1024	= 0x54;
  var MS5803_D2_2048 	= 0x56;
  var MS5803_D2_4096	= 0x58;

  var C1; // Pressure Sensitivity 
  var C2;  // Pressure Offset 
  var C3;    // Temperature coefficient of pressure sensitivity 
  var C4;    // Temperature coefficient of pressure offset 
  var C5;   // Reference Temperature 
  var C6;   // Temperature coefficient of the temperature 

  var D1;    // AdcPressure - long 
  var D2; // AdcTemperature - long 
  // Calculated values 
  var dT; //TempDifference 
  var TEMP;       // Actual temperature -40 to 85C with .01 resolution (divide by 100) - Temperature float 
  // Temperature compensated pressure 
  var OFF;       // First Order Offset at actual temperature // Offset - float 
  var SENS;      // Sensitivity at actual temperature // Sensitivity - float 
  var P;         // Temperature  

MS5803.prototype.scan = function () {
    wire.scan(function (err, data) {
      data.forEach(function (item) {
        console.log(item);
      });
    });
  };

MS5803.prototype.testConnection = function() {
    wire.writeBytes(MS5803_D2_512, 0, function(err) {});
  };

MS5803.prototype.reset = function () {
    wire.writeBytes(MS5803_RESET, 0, function(err) {});
  };

MS5803.prototype.getCalConstant = function () {
    wire.readBytes(MS5803_PROM_C1,2, function(err, res) {
      C1 = (res[0] << 8) | res[1];
    });
    wire.readBytes(MS5803_PROM_C2,2, function(err, res) {
      C2 = (res[0] << 8) | res[1];
    });
    wire.readBytes(MS5803_PROM_C3,2, function(err, res) {
      C3 = (res[0] << 8) | res[1];
    });
    wire.readBytes(MS5803_PROM_C4,2, function(err, res) {
      C4 = (res[0] << 8) | res[1];
    });
    wire.readBytes(MS5803_PROM_C5,2, function(err, res) {
      C5 = (res[0] << 8) | res[1];
    });
    wire.readBytes(MS5803_PROM_C6,2, function(err, res) {
      C6 = (res[0] << 8) | res[1];
    });

  };

MS5803.prototype.read = function(data) {
    wire.writeBytes(MS5803_D2_512, 0, function(err) {});
    wire.readBytes(MS5803_ADC_READ,3, function(err, res) {
      D2 = (res[0] << 16 | res[1] << 8) | res[2];
      dT = D2 - C5 *  Math.pow(2,8);
      TEMP=Math.floor(2000+dT*C6/Math.pow(2,23))/100;
      console.log("temperature : "+TEMP);
      data.temp = TEMP;
    });
    wire.writeBytes(MS5803_D1_512, 0, function(err) {});
    wire.readBytes(MS5803_ADC_READ,3, function(err, res) {
      D1  = (res[0] << 16 | res[1] << 8) | res[2];
      OFF = C2 * Math.pow(2,16)+(C4*dT)/Math.pow(2,7);
      SENS= C1 * Math.pow(2,15)+(C3*dT)/Math.pow(2,8);
      P = Math.floor((D1 * SENS / Math.pow(2,21) - OFF) / Math.pow(2,15))/10;

      console.log("pressure : "+P);
      data.pressure = P;
    });
  };

};
module.exports = MS5803;

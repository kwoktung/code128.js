(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Code128 = factory());
}(this, (function () { 'use strict';

  var CHARACTERS = [[" ", " ", "00", "212222", "11011001100", 0], ["!", "!", "01", "222122", "11001101100", 1], ["\"", "\"", "02", "222221", "11001100110", 2], ["#", "#", "03", "121223", "10010011000", 3], ["$", "$", "04", "121322", "10010001100", 4], ["%", "%", "05", "131222", "10001001100", 5], ["&", "&", "06", "122213", "10011001000", 6], ["'", "'", "07", "122312", "10011000100", 7], ["(", "(", "08", "132212", "10001100100", 8], [")", ")", "09", "221213", "11001001000", 9], ["*", "*", "10", "221312", "11001000100", 10], ["+", "+", "11", "231212", "11000100100", 11], [",", ",", "12", "112232", "10110011100", 12], ["-", "-", "13", "122132", "10011011100", 13], [".", ".", "14", "122231", "10011001110", 14], ["/", "/", "15", "113222", "10111001100", 15], ["0", "0", "16", "123122", "10011101100", 16], ["1", "1", "17", "123221", "10011100110", 17], ["2", "2", "18", "223211", "11001110010", 18], ["3", "3", "19", "221132", "11001011100", 19], ["4", "4", "20", "221231", "11001001110", 20], ["5", "5", "21", "213212", "11011100100", 21], ["6", "6", "22", "223112", "11001110100", 22], ["7", "7", "23", "312131", "11101101110", 23], ["8", "8", "24", "311222", "11101001100", 24], ["9", "9", "25", "321122", "11100101100", 25], [":", ":", "26", "321221", "11100100110", 26], [";", ";", "27", "312212", "11101100100", 27], ["<", "<", "28", "322112", "11100110100", 28], ["=", "=", "29", "322211", "11100110010", 29], [">", ">", "30", "212123", "11011011000", 30], ["?", "?", "31", "212321", "11011000110", 31], ["@", "@", "32", "232121", "11000110110", 32], ["A", "A", "33", "111323", "10100011000", 33], ["B", "B", "34", "131123", "10001011000", 34], ["C", "C", "35", "131321", "10001000110", 35], ["D", "D", "36", "112313", "10110001000", 36], ["E", "E", "37", "132113", "10001101000", 37], ["F", "F", "38", "132311", "10001100010", 38], ["G", "G", "39", "211313", "11010001000", 39], ["H", "H", "40", "231113", "11000101000", 40], ["I", "I", "41", "231311", "11000100010", 41], ["J", "J", "42", "112133", "10110111000", 42], ["K", "K", "43", "112331", "10110001110", 43], ["L", "L", "44", "132131", "10001101110", 44], ["M", "M", "45", "113123", "10111011000", 45], ["N", "N", "46", "113321", "10111000110", 46], ["O", "O", "47", "133121", "10001110110", 47], ["P", "P", "48", "313121", "11101110110", 48], ["Q", "Q", "49", "211331", "11010001110", 49], ["R", "R", "50", "231131", "11000101110", 50], ["S", "S", "51", "213113", "11011101000", 51], ["T", "T", "52", "213311", "11011100010", 52], ["U", "U", "53", "213131", "11011101110", 53], ["V", "V", "54", "311123", "11101011000", 54], ["W", "W", "55", "311321", "11101000110", 55], ["X", "X", "56", "331121", "11100010110", 56], ["Y", "Y", "57", "312113", "11101101000", 57], ["Z", "Z", "58", "312311", "11101100010", 58], ["[", "[", "59", "332111", "11100011010", 59], ["\\", "\\", "60", "314111", "11101111010", 60], ["]", "]", "61", "221411", "11001000010", 61], ["^", "^", "62", "431111", "11110001010", 62], ["_", "_", "63", "111224", "10100110000", 63], ["NUL", "`", "64", "111422", "10100001100", 64], ["SOH", "a", "65", "121124", "10010110000", 65], ["STX", "b", "66", "121421", "10010000110", 66], ["ETX", "c", "67", "141122", "10000101100", 67], ["EOT", "d", "68", "141221", "10000100110", 68], ["ENQ", "e", "69", "112214", "10110010000", 69], ["ACK", "f", "70", "112412", "10110000100", 70], ["BEL", "g", "71", "122114", "10011010000", 71], ["BS", "h", "72", "122411", "10011000010", 72], ["HT", "i", "73", "142112", "10000110100", 73], ["LF", "j", "74", "142211", "10000110010", 74], ["VT", "k", "75", "241211", "11000010010", 75], ["FF", "l", "76", "221114", "11001010000", 76], ["CR", "m", "77", "413111", "11110111010", 77], ["SO", "n", "78", "241112", "11000010100", 78], ["SI", "o", "79", "134111", "10001111010", 79], ["DLE", "p", "80", "111242", "10100111100", 80], ["DC1", "q", "81", "121142", "10010111100", 81], ["DC2", "r", "82", "121241", "10010011110", 82], ["DC3", "s", "83", "114212", "10111100100", 83], ["DC4", "t", "84", "124112", "10011110100", 84], ["NAK", "u", "85", "124211", "10011110010", 85], ["SYN", "v", "86", "411212", "11110100100", 86], ["ETB", "w", "87", "421112", "11110010100", 87], ["CAN", "x", "88", "421211", "11110010010", 88], ["EM", "y", "89", "212141", "11011011110", 89], ["SUB", "z", "90", "214121", "11011110110", 90], ["ESC", "[", "91", "412121", "11110110110", 91], ["FS", "|", "92", "111143", "10101111000", 92], ["GS", "],", "93", "111341", "10100011110", 93], ["RS", "~", "94", "131141", "10001011110", 94], ["US", "DEL", "95", "114113", "10111101000", 95], ["FNC3", "FNC3", "96", "114311", "10111100010", 96], ["FNC2", "FNC2", "97", "411113", "11110101000", 97], ["SHIFT", "SHIFT", "98", "411311", "11110100010", 98], ["CODEC", "CODEC", "99", "113141", "10111011110", 99], ["CODEB", "FNC4", "CODEB", "114131", "10111101110", 100], ["FNC4", "CODEA", "CODEA", "311141", "11101011110", 101], ["FNC1", "FNC1", "FNC1", "411131", "11110101110", 102], ["StartA", "StartA", "StartA", "211412", "11010000100", 103], ["StartB", "StartB", "StartB", "211214", "11010010000", 104], ["StartC", "StartC", "StartC", "211232", "11010011100", 105], ["Stop", "Stop", "Stop", "2331112", "1100011101011", 106]];

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var Code128 = function Code128(charactors) {
      classCallCheck(this, Code128);

      if (!charactors) throw new Error('Missing Charactors');

      var canvas = this.canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      var uw = 1;
      var uh = uw * 50;
      canvas.height = uh;

      var startCodeIndex = 0;
      var dataCodes = void 0;

      var charUnits = charactors.split('');
      if (/^[0-9]+$/.test(charactors) && charactors.length === 1) {
          startCodeIndex = 103;
          dataCodes = charUnits.map(function (item) {
              return CHARACTERS.find(function (o) {
                  return o[0] === item;
              });
          });
      } else if (/^[0-9]+$/.test(charactors) && charactors.length % 2 === 0) {
          startCodeIndex = 105;
          dataCodes = [];

          var _loop = function _loop(i, len) {
              var key = '' + charUnits[i] + charUnits[i + 1];
              dataCodes.push(CHARACTERS.find(function (o) {
                  return o[2] === key;
              }));
          };

          for (var i = 0, len = charUnits.length; i < len; i += 2) {
              _loop(i, len);
          }
      } else if (/^[0-9]+$/.test(charactors) && charactors.length % 2 === 1) {
          startCodeIndex = 105;
          dataCodes = [];

          var _loop2 = function _loop2(i, len) {
              var key = '' + charUnits[i] + charUnits[i + 1];
              dataCodes.push(CHARACTERS.find(function (o) {
                  return o[2] === key;
              }));
          };

          for (var i = 0, len = charUnits.length - 1; i < len; i += 2) {
              _loop2(i, len);
          }
          dataCodes.push(CHARACTERS[101]);
          dataCodes.push(CHARACTERS.find(function (o) {
              return o[0] === charUnits[charUnits.length - 1];
          }));
      } else if (/^[A-Z0-9]+$/.test(charactors)) {
          startCodeIndex = 103;
          dataCodes = charUnits.map(function (item) {
              return CHARACTERS.find(function (o) {
                  return o[0] === item;
              });
          });
      } else {
          startCodeIndex = 104;
          dataCodes = charUnits.map(function (item) {
              return CHARACTERS.find(function (o) {
                  return o[1] === item;
              });
          });
      }

      var checkSum = 0;
      dataCodes.forEach(function (item, i) {
          checkSum += item[5] * (i + 1);
      });
      checkSum += startCodeIndex;

      var checkSumCode = checkSum % 103;

      console.log(checkSumCode);
      dataCodes.push(CHARACTERS[checkSumCode]);
      dataCodes.unshift(CHARACTERS[startCodeIndex]);
      dataCodes.push(CHARACTERS[106]);
      console.log(dataCodes);

      var elements = dataCodes.map(function (item) {
          return item[4];
      });
      var units = elements.join('').split('');

      this.canvas.width = units.length * 3;
      document.body.appendChild(this.canvas);

      function drawUnit(context, i, uw, uh, color) {
          context.save();
          try {
              context.beginPath();
              context.rect(uw * i, 0, uw, uh);
              if (color) {
                  context.fillStyle = color;
              }
              context.closePath();
              context.fill();
          } finally {
              context.restore();
          }
      }

      for (var i = 0, len = units.length; i < len; i++) {
          if (+units[i]) {
              drawUnit(context, i, uw, uh, '#000');
          } else {
              drawUnit(context, i, uw, uh, '#fff');
          }
      }
  };

  return Code128;

})));

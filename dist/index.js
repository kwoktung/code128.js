(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Code128 = factory());
}(this, (function () { 'use strict';

  var ELEMENT_TABLE = [[0, " ", " ", "00", "212222", "11011001100"], [1, "!", "!", "01", "222122", "11001101100"], [2, "\"", "\"", "02", "222221", "11001100110"], [3, "#", "#", "03", "121223", "10010011000"], [4, "$", "$", "04", "121322", "10010001100"], [5, "%", "%", "05", "131222", "10001001100"], [6, "&", "&", "06", "122213", "10011001000"], [7, "'", "'", "07", "122312", "10011000100"], [8, "(", "(", "08", "132212", "10001100100"], [9, ")", ")", "09", "221213", "11001001000"], [10, "*", "*", "10", "221312", "11001000100"], [11, "+", "+", "11", "231212", "11000100100"], [12, ",", ",", "12", "112232", "10110011100"], [13, "-", "-", "13", "122132", "10011011100"], [14, ".", ".", "14", "122231", "10011001110"], [15, "/", "/", "15", "113222", "10111001100"], [16, "0", "0", "16", "123122", "10011101100"], [17, "1", "1", "17", "123221", "10011100110"], [18, "2", "2", "18", "223211", "11001110010"], [19, "3", "3", "19", "221132", "11001011100"], [20, "4", "4", "20", "221231", "11001001110"], [21, "5", "5", "21", "213212", "11011100100"], [22, "6", "6", "22", "223112", "11001110100"], [23, "7", "7", "23", "312131", "11101101110"], [24, "8", "8", "24", "311222", "11101001100"], [25, "9", "9", "25", "321122", "11100101100"], [26, ":", ":", "26", "321221", "11100100110"], [27, ";", ";", "27", "312212", "11101100100"], [28, "<", "<", "28", "322112", "11100110100"], [29, "=", "=", "29", "322211", "11100110010"], [30, ">", ">", "30", "212123", "11011011000"], [31, "?", "?", "31", "212321", "11011000110"], [32, "@", "@", "32", "232121", "11000110110"], [33, "A", "A", "33", "111323", "10100011000"], [34, "B", "B", "34", "131123", "10001011000"], [35, "C", "C", "35", "131321", "10001000110"], [36, "D", "D", "36", "112313", "10110001000"], [37, "E", "E", "37", "132113", "10001101000"], [38, "F", "F", "38", "132311", "10001100010"], [39, "G", "G", "39", "211313", "11010001000"], [40, "H", "H", "40", "231113", "11000101000"], [41, "I", "I", "41", "231311", "11000100010"], [42, "J", "J", "42", "112133", "10110111000"], [43, "K", "K", "43", "112331", "10110001110"], [44, "L", "L", "44", "132131", "10001101110"], [45, "M", "M", "45", "113123", "10111011000"], [46, "N", "N", "46", "113321", "10111000110"], [47, "O", "O", "47", "133121", "10001110110"], [48, "P", "P", "48", "313121", "11101110110"], [49, "Q", "Q", "49", "211331", "11010001110"], [50, "R", "R", "50", "231131", "11000101110"], [51, "S", "S", "51", "213113", "11011101000"], [52, "T", "T", "52", "213311", "11011100010"], [53, "U", "U", "53", "213131", "11011101110"], [54, "V", "V", "54", "311123", "11101011000"], [55, "W", "W", "55", "311321", "11101000110"], [56, "X", "X", "56", "331121", "11100010110"], [57, "Y", "Y", "57", "312113", "11101101000"], [58, "Z", "Z", "58", "312311", "11101100010"], [59, "[", "[", "59", "332111", "11100011010"], [60, "\\", "\\", "60", "314111", "11101111010"], [61, "]", "]", "61", "221411", "11001000010"], [62, "^", "^", "62", "431111", "11110001010"], [63, "_", "_", "63", "111224", "10100110000"], [64, "NUL", "`", "64", "111422", "10100001100"], [65, "SOH", "a", "65", "121124", "10010110000"], [66, "STX", "b", "66", "121421", "10010000110"], [67, "ETX", "c", "67", "141122", "10000101100"], [68, "EOT", "d", "68", "141221", "10000100110"], [69, "ENQ", "e", "69", "112214", "10110010000"], [70, "ACK", "f", "70", "112412", "10110000100"], [71, "BEL", "g", "71", "122114", "10011010000"], [72, "BS", "h", "72", "122411", "10011000010"], [73, "HT", "i", "73", "142112", "10000110100"], [74, "LF", "j", "74", "142211", "10000110010"], [75, "VT", "k", "75", "241211", "11000010010"], [76, "FF", "l", "76", "221114", "11001010000"], [77, "CR", "m", "77", "413111", "11110111010"], [78, "SO", "n", "78", "241112", "11000010100"], [79, "SI", "o", "79", "134111", "10001111010"], [80, "DLE", "p", "80", "111242", "10100111100"], [81, "DC1", "q", "81", "121142", "10010111100"], [82, "DC2", "r", "82", "121241", "10010011110"], [83, "DC3", "s", "83", "114212", "10111100100"], [84, "DC4", "t", "84", "124112", "10011110100"], [85, "NAK", "u", "85", "124211", "10011110010"], [86, "SYN", "v", "86", "411212", "11110100100"], [87, "ETB", "w", "87", "421112", "11110010100"], [88, "CAN", "x", "88", "421211", "11110010010"], [89, "EM", "y", "89", "212141", "11011011110"], [90, "SUB", "z", "90", "214121", "11011110110"], [91, "ESC", "[", "91", "412121", "11110110110"], [92, "FS", "|", "92", "111143", "10101111000"], [93, "GS", "],", "93", "111341", "10100011110"], [94, "RS", "~", "94", "131141", "10001011110"], [95, "US", "DEL", "95", "114113", "10111101000"], [96, "FNC3", "FNC3", "96", "114311", "10111100010"], [97, "FNC2", "FNC2", "97", "411113", "11110101000"], [98, "SHIFT", "SHIFT", "98", "411311", "11110100010"], [99, "CODEC", "CODEC", "99", "113141", "10111011110"], [100, "CODEB", "FNC4", "CODEB", "114131", "10111101110"], [101, "FNC4", "CODEA", "CODEA", "311141", "11101011110"], [102, "FNC1", "FNC1", "FNC1", "411131", "11110101110"], [103, "StartA", "StartA", "StartA", "211412", "11010000100"], [104, "StartB", "StartB", "StartB", "211214", "11010010000"], [105, "StartC", "StartC", "StartC", "211232", "11010011100"], [106, "Stop", "Stop", "Stop", "2331112", "1100011101011"]];

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Code128 = function () {
      function Code128(input) {
          classCallCheck(this, Code128);

          if (!input) throw new Error('Input Required');

          var start = 0;
          var end = 106;
          var elements = [];

          var chars = input.split('');
          if (/^[0-9]{1}$/.test(input)) {
              start = 103;
              elements = chars.map(function (item) {
                  return ELEMENT_TABLE.find(function (o) {
                      return o[1] === item;
                  });
              });
          } else if (/^[0-9]+$/.test(input) && input.length % 2 === 0) {
              start = 105;

              var _loop = function _loop(i, len) {
                  var key = '' + chars[i] + chars[i + 1];
                  elements.push(ELEMENT_TABLE.find(function (o) {
                      return o[3] === key;
                  }));
              };

              for (var i = 0, len = chars.length; i < len; i += 2) {
                  _loop(i, len);
              }
          } else if (/^[0-9]+$/.test(input) && input.length % 2 === 1) {
              start = 105;

              var _loop2 = function _loop2(i, len) {
                  var key = '' + chars[i] + chars[i + 1];
                  elements.push(ELEMENT_TABLE.find(function (o) {
                      return o[3] === key;
                  }));
              };

              for (var i = 0, len = chars.length - 1; i < len; i += 2) {
                  _loop2(i, len);
              }
              elements.push(ELEMENT_TABLE[101]);
              elements.push(ELEMENT_TABLE.find(function (o) {
                  return o[1] === chars[chars.length - 1];
              }));
          } else if (/^[A-Z0-9]+$/.test(input)) {
              start = 103;
              elements = chars.map(function (item) {
                  return ELEMENT_TABLE.find(function (o) {
                      return o[1] === item;
                  });
              });
          } else {
              start = 104;
              elements = chars.map(function (item) {
                  return ELEMENT_TABLE.find(function (o) {
                      return o[2] === item;
                  });
              });
          }

          var checkSum = 0;
          elements.forEach(function (item, i) {
              checkSum += item[0] * (i + 1);
          });
          checkSum += start;

          elements.push(ELEMENT_TABLE[checkSum % 103]);
          elements.unshift(ELEMENT_TABLE[start]);
          elements.push(ELEMENT_TABLE[end]);
          this.elements = elements;
      }

      createClass(Code128, [{
          key: 'insert',
          value: function insert() {
              var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;

              var canvas = document.createElement('canvas');
              var context = canvas.getContext('2d');
              var units = this.elements.map(function (item) {
                  return item[5];
              }).join('').split('');
              var uw = 1;
              var uh = uw * 50;
              canvas.height = uh;
              canvas.width = units.length * 3;
              var drawUnit = function drawUnit(context, i, uw, uh, color) {
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
              };
              for (var i = 0, len = units.length; i < len; i++) {
                  if (+units[i]) {
                      drawUnit(context, i, uw, uh, '#000');
                  } else {
                      drawUnit(context, i, uw, uh, '#fff');
                  }
              }
              target.appendChild(canvas);
              return canvas;
          }
      }]);
      return Code128;
  }();

  return Code128;

})));

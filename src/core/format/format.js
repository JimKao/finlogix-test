var checker = require('../valid/check');
var strFormat = require('string-format');

const Format = { 
  toPlainString: function (whichever) {
    var type = typeof whichever;
    if (type === 'string') {
      return whichever;
    }
    if (type === 'boolean' || type === 'number' || type === 'object') {
      try {
        return JSON.stringify(whichever);
      } catch (e) {
        return type;
      }
    }
    return type;
  },

  joinStrings: function (strings, separator) {
    if (!Array.isArray(strings)) {
      return this.toPlainString(strings);
    }
    var length = strings.length;
    var strs = [];
    var spr = separator || ' ';
    var i;
    for (i = 0; i < length; i++) {
      strs.push(this.toPlainString(strings[i]));
    }
    return strs.join(spr);
  },

  getKeyByValue: function (value, checkObj) {
    for (var key in checkObj) {
      if (checkObj.hasOwnProperty(key)) {
        if (checkObj[key] == value) {
          return key;
        }
      }
    }
    return null;
  },

  // Trim and clear linebreak
  trimLineBreak: function (str) {
    return str.replace(/^\s+|\s+$/g, '');
  },

  formatDate: function (date, format, utc) {
    if (!checker.isSet(date)) {
      return '';
    }
    if (!checker.isFunction(date.getFullYear)) {
      return '';
    }

    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function ii(i, len) {
      var s = i + "";
      len = len || 2;
      while (s.length < len) s = "0" + s;
      return s;
    }

    var y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);

    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);

    var d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);

    var H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);

    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);

    var m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);

    var s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);

    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);

    var T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

    var t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

    var tz = -date.getTimezoneOffset();
    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc) {
      tz = Math.abs(tz);
      var tzHrs = Math.floor(tz / 60);
      var tzMin = tz % 60;
      K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);

    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

    format = format.replace(/\\(.)/g, "$1");

    return format;
  },

  formatTimeSpan: function (diff, format) {
    if (!checker.isFiniteNumber(diff)) return '';

    var msec = diff;
    var dd = Math.floor(msec / 1000 / 60 / 60 / 24);
    msec -= dd * 1000 * 60 * 60 * 24;
    var hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    var mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    var ss = Math.floor(msec / 1000);
    msec -= ss * 1000;

    if (diff < 0) {
      dd = 0;
      hh = 0;
      mm = 0;
      ss = 0;
    }

    format = format.replace(/(^|[^\\])dd+/g, "$1" + dd);
    format = format.replace(/(^|[^\\])hh+/g, "$1" + hh);
    format = format.replace(/(^|[^\\])mm+/g, "$1" + mm);
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ss);
    return format;
  },

  formatBytes: function (bytes, decimals) {
    if (bytes == 0) return '0 Byte';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
  },

  toFixDigit: function (num, numdigits) {
    if (!checker.isPositiveInt(num)) return '';
    if (!checker.isPositiveInt(numdigits)) return num.toString();

    var numStr = num.toString();
    while (numStr.length < numdigits) {
      numStr = '0' + numStr;
    }
    return numStr;
  },

  toPrecisionDigit: function (num, numdigits) {
    if (checker.isPositiveInt(num)) {
      return num.toString();
    }
    if (!checker.isPositiveInt(numdigits)) {
      return num.toString();
    }
    return num.toFixed(numdigits);
  },

  toFixPrecision: function (num, numdigits) {
    if (!checker.isPositiveInt(numdigits)) {
      return num.toString();
    }
    return num.toFixed(numdigits);
  },

  str: function () {
    return strFormat.apply(null, arguments);
  }

};
module.exports = Format;
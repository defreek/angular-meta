/**
 * Constructor. use `new`.
 */
var Utils = function() {

  /**
   * Adapted from underscorejs _.defaults() method.
   * @param  {object} obj
   * @return {object}
   */
  this.defaults = function(obj) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i=0, len=args.length; i<len; i+=1) {
      for (var prop in args[i]) {
        if (obj[prop] === void 0) obj[prop] = args[i][prop];
      }
    }
    return obj;
  };

  this.clone = function(obj) {
    if(obj === null || typeof(obj) !== 'object') return obj;
    var temp = obj.constructor(); // changed
    for (var key in obj) temp[key] = this.clone(obj[key]);
    return temp;
  };

};
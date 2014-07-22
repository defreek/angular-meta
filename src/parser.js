/**
 * Constructor. use `new`.
 * @param {array} routes
 */
var Parser = function(routes) {

  var self = this;

  /**
   * Get meta info for a given state.
   * @param  {string} currentState
   * @return {object}
   */
  this.getStateInfo = function(currentState) {};

  /**
   * Get meta info for a given route.
   * @param  {string} currentRoute
   * @return {object}
   */
  this.getRouteInfo = function(currentRoute) {
    var placeholders       = {}
      , currentRoutePaths  = this._pathToArray(currentRoute);

    // Itterate through each route.
    for (var i=0, len=this._routes.length; i<len; i+=1) {
      // Split the route into an array of route paths.
      var path  = this._routes[i].path;
      var info  = this._routes[i].info;
      var paths = this._pathToArray(path);

      if (!paths.length) continue;

      // Itterate through each route part to check for a match.
      var match = true;
      for (var ii=0, length=paths.length; ii<length; ii+=1) {
        // If the route arg is a placeholder.
        if ( paths[ii].indexOf(':')  === 0 ) {
          placeholders[ paths[ii] ] = currentRoutePaths[ii];
          continue;
        }
        // If the route does not match the location and
        // there is not a wildcard in the route.
        if ( paths[ii] !== currentRoutePaths[ii] && paths[ii].indexOf('*') === -1 ) {
          match = false;
          placeholders = {};
          break;
        }
      }

      if (match) return this._replacePlaceholders(this._utils.clone(info), placeholders);

    }

  };

  /**
   * Replace all object values that contain a placeholder.
   * Recursive function - will replace properties w/ object values.
   * Will modify source object by reference. Be sure to clone if this
   * behavior is undesired.
   * @param {object} object
   * @param {object} placeholders key=placeholder, value=replacement
   * @return {object}
   */
  this._replacePlaceholders = function(object, placeholders) {
    if (!placeholders || !Object.keys(placeholders).length) return object;
    for (var property in object) {
      if (!object.hasOwnProperty(property)) continue;
      for (var placeholder in placeholders) {
        var type = typeof object[property];
        if (type === 'string')
          object[property] = object[property].replace(placeholder, placeholders[placeholder]);
        if (type === 'object')
          object[property] = this._replacePlaceholders(object[property], placeholders);
      }
    }
    return object;
  };

  /**
   * Convert a path string into an array.
   * @param  {string} path
   * @return {array}
   */
  this._pathToArray = function(path) {
    return path !== '/' ? path.split('/').filter(Boolean) : ['/'];
  };

  /**
   * Order routes array by most specific to least specific.
   * @param  {array} routes
   * @return {object} this
   */
  this._normalizeRoutes = function(routes) {
    routes.sort(function(a, b) {
      return self._pathToArray(b.path).length - self._pathToArray(a.path).length;
    });
    return this;
  };

  // Class constructor.
  (function() {
    self._utils   = new Utils();
    self._routes = routes;
    self._normalizeRoutes(routes);
  })();

};
;(function(angular, undefined) {

'use strict';

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
    var placeholders       = []
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
          placeholders[ii] = paths[ii];
          continue;
        }
        // If the route does not match the location and
        // there is not a wildcard in the route.
        if ( paths[ii] !== currentRoutePaths[ii] && paths[ii].indexOf('*') === -1 ) {
          match = false;
          placeholders = [];
          break;
        }
      }

      if (match)
        return this._interpolatePlaceholders(this._utils.clone(info), placeholders);

    }

  };

  /**
   * Replaces all placeholder elements that begin w/ a ':'
   * in an object.
   * @param {object} info
   * @param {object} placeholders key=placeholder, value=replacement
   * @return {object}
   * @todo test to make sure placeholders are replaced in nested objects.
   */
  this._interpolatePlaceholders = function(info, placeholders) {
    if (!placeholders || !placeholders.length) return;

    return info;
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
angular.module('meta', [])
.provider('Meta', function() {

  var self      = this;
  var routes    = [];
  var otherwise = {
    title: '',
    description: ''
  };
  var options = {
    prefix: '',
    suffix: '',
    uirouter: false
  };

  this._utils = new Utils();

  /**
   * Update rootScope w/ the current meta info.
   * @param {object} $rootScope
   * @param {object} $injector
   * @param {boolean} [uirouter]
   * @return {object} this
   */
  var update = function($rootScope, $injector, uirouter) {
    var info = null;
    if (uirouter) {
      info = this._parser.getStateInfo($injector.get('$state'));
    }
    else {
      info = this._parser.getRouteInfo($injector.get('$location').path());
    }

    if (info) {
      $rootScope.meta = info;
      $rootScope.meta.title = options.prefix + info.title + options.suffix;
      $rootScope.$emit('metaUpdated');
    }
    return self;
  };

  /**
   * Set options.
   * @param  {object} opts
   * @return {object} this
   */
  this.options = function(opts) {
    options = this._utils.defaults(opts, options);
    return this;
  };

  /**
   * Register meta info for a specific route(s).
   * @param {string} path the path to match routes against.
   * Placeholders beginning with ':' are accepted.
   * @param  {object|function( callback(Object info) )} info
   *   meta title and description.
   * @return {object} this
   */
  this.when = function(path, info) {
    if ( typeof info === 'function' )
      info.call(null, function(done) {
        return self.when(path, done);
      });
    else
      routes.push({ path: path, info: info });
    return this;
  };

  /**
   * Register default values for title and description if
   * no routes are matched.
   * @param  {object|function( callback(Object info) )} info
   *   the default meta title and description.
   * @return {object} this
   */
  this.otherwise = function(info) {
    if ( typeof info === 'function' )
      info.call(null, function(done) {
        return self.otherwise(done);
      });
    else
      otherwise = info;
    return this;
  };

  this.$get = ['$rootScope', '$injector',
  function($rootScope, $injector) {
    return {
      init: function() {

        // Initalize parser once all routes have been added.
        self._parser = new Parser(routes);

        // Declare empty object on $rootScope.
        if ($rootScope.meta) {
          throw 'angular-meta could not properly initalize. $rootScope.meta is already defined.';
        }
        $rootScope.meta = {};

        // Listen for changes to the routes, update the meta info,
        // and trigger an event to the outside world.
        if (options.uirouter) {
          $rootScope.$on('$stateChangeSuccess', function() {
            update.call(self, $rootScope, $injector, options.uirouter);
          });
        }
        else {
          $rootScope.$on('$routeChangeSuccess', function() {
            update.call(self, $rootScope, $injector, options.uirouter);
          });
        }

      },
      // Return current meta title and description.
      get: function() {
        // return $rootScope.meta;
      },
      // Add additional meta info items, e.g. via controllers,
      // later in execution.
      add: function(path, info) {
        // self.when(path, info);
        // return update($rootScope, $injector, options.uirouter);
      }
    };

  }];

});



})(angular);
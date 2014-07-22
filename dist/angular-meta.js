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
   * Get meta info for a given route.
   * @param  {string} currentRoute
   * @return {object}
   */
  this.getInfo = function(currentRoute) {
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
  this.sortRoutes = function() {
    this._routes.sort(function(a, b) {
      return self._pathToArray(b.path).length - self._pathToArray(a.path).length;
    });
    return this;
  };

  /**
   * Replace all state paths w/ their url paths.
   * @return {object} this
   */
  this.normalizeStates = function($state) {
    for (var i=0,len=this._routes.length; i<len; i+=1) {
      var state = this._routes[i].path;
      // If the state is actully a state.
      if (state.indexOf('/') !== 0 && state.indexOf(':') === -1 && state.indexOf('*') === -1) {
        var stateUrl = $state.get(state).url;
        if (stateUrl) this._routes[i].path = stateUrl;
      }
    }
    return this;
  };

  // Class constructor.
  (function() {
    self._utils  = new Utils();
    self._routes = routes;
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
  var update = function($rootScope, $location, uirouter) {
    var info = null;
    // if (uirouter) {
    //   info = this._parser.getStateInfo($injector.get('$state'));
    // }
    // else {
    //   info = this._parser.getRouteInfo($injector.get('$location').path());
    // }
    info = this._parser.getInfo( $location.path() );

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

  this.$get = ['$rootScope', '$location', '$injector',
  function($rootScope, $location, $injector) {
    return {
      init: function() {

        // Declare empty object on $rootScope.
        if ($rootScope.meta) {
          throw 'angular-meta could not properly initalize. $rootScope.meta is already defined.';
        }
        $rootScope.meta = {};

        // Initalize parser once all routes have been added.
        self._parser = new Parser(routes);

        // Listen for changes to the routes, update the meta info,
        // and trigger an event to the outside world.
        if (options.uirouter) {
          self._parser.normalizeStates( $injector.get('$state') ).sortRoutes();
          $rootScope.$on('$stateChangeSuccess', function() {
            update.call(self, $rootScope, $location, options.uirouter);
          });
        }
        else {
          self._parser.sortRoutes();
          $rootScope.$on('$routeChangeSuccess', function() {
            update.call(self, $rootScope, $location, options.uirouter);
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
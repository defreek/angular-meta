'use strict';

angular.module('meta', [])
.provider('Meta', function() {

  var self = this;
  var routes = {};
  var otherwise = {
    title: '',
    description: ''
  };
  var options = {
    prefix: '',
    suffix: ''
  };

  /**
   * Get meta info for a given route.
   * @param  {string} location the url to get meta info for.
   * @return {object} object w/ meta info.
   */
  var getInfo = function(location) {
    var info        = {}
      , placeholder = [];

    info = defaults( info, otherwise );

    // Split the location path into an array of args.
    location = location.split('/').filter(Boolean);

    // Itterate through each route added via the public when() method.
    var routeKeys = Object.keys(routes);
    for (var i = 0, len = routeKeys.length; i < len; i+=1) {
      // Split the route into an array of args.
      var route = routeKeys[i].split('/').filter(Boolean);

      // Matching routes need to have the same number of
      // arguments as the location url.
      if ( route.length !== location.length ) {
        continue;
      }

      // Itterate through each route arg to check for a match.
      var match = true;
      for (var ii = 0, length = route.length; ii < length; ii+=1) {
        // If the route arg is a placeholder.
        if ( route[ii].indexOf(':')  === 0 ) {
          placeholder[ii] = route[ii];
          continue;
        }
        // If the route does not match the location and
        // there is not a wildcard in the route.
        if ( route[ii] !== location[ii] && route[ii].indexOf('*') === -1 ) {
          match = false;
          placeholder = [];
          break;
        }
      }

      if (match) {
        // We could simply set info = routes[ routeKeys[i] ]
        // but this would cause reference problems that occur when
        // replacing the placeholder values for the title and description.
        // This is a safer, and native, alternative to cloning the object.
        for ( var key in routes[ routeKeys[i] ] ) {
          info[key] = routes[ routeKeys[i] ][key];
        }
        break;
      }
    }

    // Replace placeholders in meta info and meta description strings.
    if ( placeholder.length > 0 ) {
      for (var placeholderKey in placeholder) {
        for (var infoKey in info) {
          info[infoKey] = info[infoKey].split(placeholder[placeholderKey]).join(location[placeholderKey]);
        }
      }
    }

    return info;
  };

  /**
   * Update rootScope w/ the current meta info.
   * @param  {object} $rootScope
   * @param  {object} $location
   */
  var update = function($rootScope, $location) {
    var info = getInfo( $location.path() );
    $rootScope.meta = info;
    $rootScope.meta.title = options.prefix + info.title + options.suffix;
    // Emit event so applications have the option of setting
    // DOM flags for headless browsers rendering the page for SEO.
    $rootScope.$emit('metaUpdated', info);
  };

  /**
   * Adapted from underscorejs _.defaults() method.
   * @param  {object} obj
   * @return {object}
   */
  var defaults = function(obj) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i=0, len=args.length; i<len; i+=1) {
      for (var prop in args[i]) {
        if (obj[prop] === void 0) obj[prop] = args[i][prop];
      }
    }
    return obj;
  };

  /**
   * Set options.
   * @param  {object} opts
   * @return {object} this
   */
  this.options = function(opts) {
    options = defaults( opts, options );
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
      routes[path] = info;
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
        try {
          this.$state = $injector.get('$state');
        }
        catch (e) {
          this.$state = false;
        }
        try {
          this.$route = $injector.get('$route');
        }
        catch (e) {
          this.$route = false;
        }
        $rootScope.meta = {};
        if (this.$route) $rootScope.$on('$routeChangeSuccess', function() { update($rootScope, $location); });
        if (this.$state) $rootScope.$on('$stateChangeSuccess', function() { update($rootScope, $location); });
      },
      // Return current meta title and description.
      get: function() {
        return $rootScope.meta;
      },
      // Add additional meta info items, e.g. via controllers,
      // later in execution.
      add: function(path, info) {
        self.when(path, info);
        update($rootScope, $location);
        return self;
      }
    };

  }];

});
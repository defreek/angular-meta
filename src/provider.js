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


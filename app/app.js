(function(){

  'use strict';

  angular.module('angular-meta', [
    'ngRoute',
    'meta',
    'templates',
    'angular-meta-main',
    'angular-meta-about',
  ])
  .config(['$routeProvider', 'MetaProvider',
  function($routeProvider, MetaProvider) {

    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    MetaProvider
      .options({
        prefix: 'Hello!',
        suffix: ' | Demo site',
        uirouter: false
      })
      .when('/', {
        title: 'Angular Meta Demo',
        description: 'Angular Meta Demo'
      })
      .when('/about/:test', function(done) {
        var result = {
          title: 'About page title',
          description: 'About page description',
        };
        done( result );
      })
      .when('/about/ttt/t', {
        title: 'Angular Meta Demo',
        description: 'Angular Meta Demo'
      })
      .when('/asd', {
        title: 'Angular Meta Demo',
        description: 'Angular Meta Demo'
      })
      .when('/adsf/adsf/asdf/dsadf/', {
        title: 'Angular Meta Demo',
        description: 'Angular Meta Demo'
      });

  }])
  .run(['Meta', function(Meta) {
    Meta.init();
  }]);

})();
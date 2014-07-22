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
      .when('/about', function(done) {
        var result = {
          title: 'About page title',
          description: 'About page description',
        };
        done( result );
      });

  }])
  .run(['Meta', function(Meta) {
    Meta.init();
  }]);

})();
(function(){
  'use strict';

  angular.module('angular-meta-about', ['ngRoute'])
    .config(function ($routeProvider) {
      $routeProvider
        .when('/about', {
          templateUrl: 'about/about.html',
          controller: 'AboutCtrl'
        });
    })
    .controller('AboutCtrl', function ($scope, Meta) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });

})();
(function(){
  'use strict';

  angular.module('angular-meta-main', ['ngRoute'])
    .config(function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'main/main.html',
          controller: 'MainCtrl'
        });
    })
    .controller('MainCtrl', function ($scope, $rootScope, Meta) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    });

})();
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
          title: 'About :test title',
          description: 'About page description',
          thing: {
            a: 'this :test',
            b: 'another test'
          }
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
(function(){
  'use strict';

  angular.module('angular-meta-about', ['ngRoute'])
    .config(function ($routeProvider) {
      $routeProvider
        .when('/about/:whatever', {
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
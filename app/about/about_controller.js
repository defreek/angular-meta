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
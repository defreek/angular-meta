(function(){
	'use strict';

	angular.module('angular-meta', [ 'ngRoute','angular-meta-main','templates' ])
	  .config(function ($routeProvider) {
	    $routeProvider
	      .otherwise({
	        redirectTo: '/'
	      });
	  });
	  
})();
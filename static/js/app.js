'use strict';


// Declare app level module which depends on filters, and services
angular.module('ausTrafficWatchApp', [
  'ngRoute',
  'ui.bootstrap',
  'google-maps',
  'ausTrafficWatchApp.filters',
  'ausTrafficWatchApp.services',
  'ausTrafficWatchApp.directives',
  'ausTrafficWatchApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {templateUrl: 'static/partials/map1.html', controller: 'ATWMapController1'});
  $routeProvider.when('/view2', {templateUrl: 'static/partials/map2.html', controller: 'ATWMapController2'});
  $routeProvider.when('/view3', {templateUrl: 'static/partials/map3.html', controller: 'ATWMapController3'});
  $routeProvider.when('/about', {templateUrl: 'static/partials/about.html', controller:'AboutController'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);

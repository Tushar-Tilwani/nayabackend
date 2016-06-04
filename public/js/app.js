var app = angular.module('NAYA', ['ngRoute', 'appRoutes', 'FormCtrl','HomeCtrl','ChatCtrl']);

app.run(function($rootScope) {
   $rootScope.$on('$routeChangeSuccess', function(ev,data) {   
     if (data.$$route && data.$$route.controller)
       $rootScope.controller = data.$$route.controller;
   })
});
angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider',function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/home.html',
			controller: 'HomeController'
		})

		.when('/home', {
			templateUrl: 'views/home.html',
			controller: 'HomeController'
		})

		.when('/forms', {
			templateUrl: 'views/forms.html',
			controller: 'FormController'
		})

		.when('/chat', {
			templateUrl: 'views/chat.html',
			controller: 'ChatController'
		});

	$locationProvider.html5Mode(true);

}]);
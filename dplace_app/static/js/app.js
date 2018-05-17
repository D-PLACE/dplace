angular.module('dplace', ['ngRoute', 'dplaceServices', 'ui.bootstrap', 'dplaceFilters', 'dplaceMapDirective', 'languagePhylogenyDirective']) // Should look at ui-router
    .config(dplaceRouter);

function dplaceRouter($routeProvider, $locationProvider) {
    $routeProvider
        .when('/search', {
            templateUrl: '/static/partials/search.html',
            controller: 'SearchCtrl'
        })
        .when('/societies/search/:name', {
            templateUrl: '/static/partials/societies.html',
            controller:'SearchCtrl'
        })
        .when('/societies', {
            templateUrl: '/static/partials/societies.html',
            controller: 'SocietiesCtrl',
            reloadOnSearch: false
        })
        .when('/societies/search', {
            templateUrl: '/static/partials/societies.html',
            controller: 'SocietiesCtrl'
        })
        .when('/home', {
            templateUrl: '/static/partials/home.html',
            controller: 'HomeCtrl'
        })
        .when('/about', {
            templateUrl: '/static/partials/info/about.html',
            controller: 'AboutCtrl'
        })
        .when('/howto', {
            templateUrl:'/static/partials/source_info.html',
            controller:'SourceInfoCtrl'
        })
        .when('/team', {
            templateUrl:'/static/partials/info/team.html',
            controller:'AboutCtrl'
        })
        .when('/legal', {
            templateUrl:'/static/partials/info/legal.html',
            controller:'AboutCtrl'
        })
        .when('/privacy', {
            templateUrl:'/static/partials/info/privacy.html',
            controller:'AboutCtrl'
        })
        .when('/source', {
            templateUrl:'/static/partials/info/source.html',
            controller:'AboutCtrl'
        })
        .when('/technology', {
            templateUrl:'/static/partials/info/technology.html',
            controller:'AboutCtrl'
        })
        .when('/publication', {
            templateUrl:'/static/partials/info/publication.html',
            controller:'AboutCtrl'
        })
        .when('/howtocite', {
            templateUrl:'/static/partials/info/howtocite.html',
            controller:'AboutCtrl'
        })
        .otherwise({
	        redirectTo: '/home'
	});
    $locationProvider.html5Mode(true);
}

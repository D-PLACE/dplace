function AppCtrl($scope, $location, $http, searchModelService) {
    $scope.searchButton = {'disabled': false, 'text': 'Search'};
    $scope.model = searchModelService.getModel();
    
    // Root controller for app
    $scope.setActive = function(tabName) {
        $scope.searchActive = '';
        $scope.societiesActive = '';
        $scope.homeActive = '';
        $scope.aboutActive = '';
        $scope.sourceInfoActive = '';
        $scope[tabName + 'Active'] = 'active'
        if (tabName === 'home') {
            $('#homeLogo').css('visibility', 'hidden');
        } else {
            $('#homeLogo').css('visibility', 'visible');
        }
    };
    
    $scope.appendQueryString = function() {
        var queryObject = $scope.model.getQuery();
        var key, val;
        for (key in queryObject) {
            val = queryObject[key];
            if (key != 'name') {
                val = JSON.stringify(val);
            }
            $location.search(key, val);
        }
    }
    

    $scope.switchToResults = function() {
        $location.path('/societies');
        $scope.appendQueryString();
    };
    

    $scope.switchToSocResults = function(name) {
        $location.path('/societies/search/'+name);
    };

    $scope.getSocietyIds = function() {
        return $scope.model.getSocieties().map(function (container) {
            return container.society.id;
        });
    };
}
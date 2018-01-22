function EnvironmentalCtrl($scope, searchModelService) {
        
    $scope.addVariable = function() { 
        searchModelService.getModel().getEnvironmentalData().selectedVariables.push(
            {'vals': ['', ''], 
            'selectedFilter': searchModelService.getModel().getEnvironmentalData().filters,
            'categories': searchModelService.getModel().getEnvironmentalData().categories
        });
    };
        
    $scope.doSearch = function() {
        $scope.search();
    };
}
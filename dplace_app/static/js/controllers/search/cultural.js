function CulturalCtrl($scope, searchModelService) {
    $scope.traits = [searchModelService.getModel().getCulturalTraits()];

    //keeps track of number of variables selected
    $scope.numVars =  function() {
        $scope.numSelectedVars = 0;
        $scope.traits.forEach(function(trait) {
            trait.selectedVariables.forEach(function(v) {
                if (v.data_type.toLowerCase() == 'continuous' || (v.codes && v.codes.filter(function(c) { return c.isSelected; }).length > 0)) $scope.numSelectedVars += 1;
            });
        });    
    };
    
    $scope.$on('numVars', $scope.numVars);

    // wired to the search button.
    $scope.doSearch = function() {
        if ($scope.numSelectedVars > 4) {
            $scope.errors = "Error, search is limited to 4 variables";
            return;
        }
        $scope.search();
    };
}

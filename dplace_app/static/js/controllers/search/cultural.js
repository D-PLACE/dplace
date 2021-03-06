function CulturalCtrl($scope, searchModelService) {

    //keeps track of number of variables selected
    $scope.numVars =  function() {
        $scope.numSelectedVars = 0;
        $scope.traits.forEach(function(trait) {
            trait.selectedVariables.forEach(function(v) {
                if (v.data_type.toLowerCase() == 'continuous' || (v.codes && v.codes.filter(function(c) { return c.isSelected; }).length > 0)) $scope.numSelectedVars += 1;
            });
        });
        if ($scope.numSelectedVars <= 4) {
            $scope.searchButton.errors = "";
        }
    };
    
    $scope.$on('numVars', $scope.numVars);
    
    /* reset search */
    var linkModel = function() {
        $scope.traits = [searchModelService.getModel().getCulturalTraits()];
        $scope.numVars();
    };
    $scope.$on('searchModelReset', linkModel);
    linkModel();
}

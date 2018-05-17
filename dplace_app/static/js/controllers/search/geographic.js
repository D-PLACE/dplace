function GeographicCtrl($scope, searchModelService) {
    var linkModel = function() {
        // Get a reference to the geographic regions from the model
        $scope.geographic = searchModelService.getModel().getGeographicRegions();
        $scope.$watchCollection('geographic.selectedRegions', function() {
            $scope.geographic.badgeValue = $scope.geographic.selectedRegions.length;
        });
    };
    $scope.$on('searchModelReset', linkModel); // When model is reset, update our model
    linkModel();
}

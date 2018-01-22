function VariableSearchCtrl($scope, searchModelService, getCategories, Variable, MinAndMax, CodeDescription) {
    var linkModel = function() {
        $scope.filters = searchModelService.getModel().getEnvironmentalData().filters;
        if ($scope.model.searchParams.selectedButton.value == 'cultural') {
            $scope.variables = [searchModelService.getModel().getCulturalTraits()];
            $scope.count = 0;
        } else {
            $scope.variables = searchModelService.getModel().getEnvironmentalData().selectedVariables;
            if ($scope.variables.length == 0) {
                $scope.variables.push({'vals': ['', ''], 'selectedFilter': $scope.filters[0], 'categories': []});
                $scope.variables[0].categories = searchModelService.getModel().getEnvironmentalData().categories;
            }
        }
    };
    $scope.$on('searchModelReset', linkModel);
    linkModel();
    
    $scope.sourceChanged = function(variable) {
        variable.categories = [];
        variable.categories = getCategories.query({ query: { source: variable.selectedSource.id }});
    };
    
    $scope.categoryChanged = function(variable) {
        if ($scope.model.searchParams.selectedButton.value == 'cultural')
            variable.indexVariables = Variable.query({ index_categories: variable.selectedCategory.id, source: variable.selectedSource.id });
        else
            variable.indexVariables = Variable.query({ index_categories: [variable.selectedCategory.id] });
    };
    
    $scope.variableChanged = function(variable) {
        if (variable.selectedVariable != null) {
            if (variable.selectedVariable.data_type.toLowerCase() == 'continuous') {
                $scope.values = MinAndMax.query({query: {id: variable.selectedVariable.id}});
                variable.selectedVariable.selectedFilter = $scope.filters[0];
                variable.VariableForm.$setPristine();
                if ($scope.model.searchParams.selectedButton.value == 'cultural') {
                    if (variable.selectedVariables.map(function(v) { return v.id; }).indexOf(variable.selectedVariable.id) == -1) {
                        variable.selectedVariables.push(variable.selectedVariable);
                        searchModelService.getModel().getCulturalTraits().badgeValue++;
                    }
                } else {
                    searchModelService.getModel().getEnvironmentalData().badgeValue = $scope.variables.map(function(v) { return v.selectedVariable; }).length;
                }
                $scope.filterChanged(variable);
            } else {                
                selectedVariables = ($scope.model.searchParams.selectedButton.value == 'cultural') ? variable.selectedVariables : $scope.variables;
                if (selectedVariables.indexOf(variable.selectedVariable) == -1) {
                    variable.selectedVariable.codes = [];
                    getCodes = CodeDescription.query({variable: variable.selectedVariable.id});
                    variable.selectedVariable.selected = []; 
                    getCodes.$promise.then(function(result) {
                        result.forEach(function(c) {
                            c.isSelected = true;
                            $scope.codeSelected(variable.selectedVariable, c);
                            variable.selectedVariable.codes.push(c);
                        })
                    });
                    variable.allSelected = true;
                    if ($scope.model.searchParams.selectedButton.value == 'cultural') {
                        variable.selectedVariables.push(variable.selectedVariable);
                    } 
                }
            }
        }
        if ($scope.model.searchParams.selectedButton.value == 'cultural') $scope.numVars();
    };

    $scope.codeSelected = function (variable, code) { 
        if (code.isSelected) {
            if (variable.type == 'cultural') $scope.searchModel.getCulturalTraits().badgeValue++;
            else if (variable.type == 'environmental') $scope.searchModel.getEnvironmentalData().badgeValue = $scope.variables.map(function(v) { return v.selectedVariable; }).length;
        } else {
            code.type = variable.type == 'cultural' ? 'c' : 'e'
            $scope.removeFromSearch(code, 'code');        
        }
        if (variable.codes.filter(function (c) { return c.isSelected; }).length == variable.codes.length) variable.allSelected = true;
        else variable.allSelected = false;
        
        if ($scope.model.searchParams.selectedButton.value == 'cultural') $scope.numVars();
    };
    
    $scope.filterChanged = function(variable) {
        if (variable.VariableForm.$dirty && variable.selectedVariable.selectedFilter.operator != 'all') return; 
        if ($scope.model.searchParams.selectedButton.value == 'cultural') {
            selected_variable = variable.selectedVariables.filter(function(v) { 
                return v.id == variable.selectedVariable.id;
            });
        } else {
            selected_variable = $scope.variables.filter(function(v) { 
                return v.selectedVariable.id == variable.selectedVariable.id;
            }).map(function(v) { return v.selectedVariable; });
        }
        if (selected_variable.length == 1) {
            $scope.values.$promise.then(function(result) {
                selected_variable[0].vals = [result.min, result.max]
            });
        }
    };
    
    $scope.selectAll = function(variable) {
        if (variable.allSelected) {
            variable.codes.forEach(function(c) {
                if (!c.isSelected) {
                    c.isSelected = true;
                    $scope.codeSelected(variable, c);
                }
            });
        } else {
            variable.codes.forEach(function(c) {
                if (c.isSelected) {
                    c.isSelected = false;
                    $scope.codeSelected(variable, c);
                }
            });
        }
    };
}
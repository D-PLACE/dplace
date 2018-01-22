/**
 * Controller for the search tab. pops in sub controllers for geographic/cultural/etc
 *
 * @param $scope
 * @param colorMapService
 * @param searchModelService
 * @param FindSocieties
 * @constructor
 */
function SearchCtrl($scope, $window, $location, colorMapService, searchModelService, FindSocieties) {
    $scope.setActive('search');
    $scope.searchModel = searchModelService.getModel();
    $scope.searchBySocietyButton = {text: 'Search', disabled: false};
    $scope.selectedButton = $scope.searchModel.selectedButton;
    $scope.searchCriteria = "View selected search criteria";

    var rP = 'radioPlaces';
    var rL = 'radioLanguage';
    var rC = 'radioCulture';
    var rE = 'radioEnv';
    // preserve active button style if any
    if($scope.selectedButton) {
        switch($scope.selectedButton.radioClass) {
        case 'radioPlaces':
            rP += ' active';
            break;
        case 'radioLanguage':
            rL += ' active';
            break;
        case 'radioCulture':
            rC += ' active';
            break;
        case 'radioEnv':
            rE += ' active';
            break;
        }
    }
    $scope.buttons = [
        {radioClass: rP, value:'geographic', name:'PLACES', badgeValue:
            function() { return $scope.searchModel.getGeographicRegions().badgeValue; }
        },
        {radioClass: rL, value:'language', name:'LANGUAGE', badgeValue:
            function() { return $scope.searchModel.getLanguageClassifications().badgeValue; }
        },
        {radioClass: rC, value:'cultural', name:'CULTURE', badgeValue:
            function() { return $scope.searchModel.getCulturalTraits().badgeValue; }
        },
        {radioClass: rE, value:'environmental', name:'ENVIRONMENT', badgeValue:
            function() { return $scope.searchModel.getEnvironmentalData().badgeValue; }
        }
    ];

    // All of this needs to move into model
    $scope.disableSearchButton = function () {
        $scope.searchButton.disabled = true;
        $scope.searchButton.text = 'Working...';
        $scope.searchBySocietyButton = {text: 'Working...', disabled: true};
    };

    $scope.enableSearchButton = function () {
        $scope.searchButton.disabled = false;
        $scope.searchButton.text = 'Search';
        $scope.searchBySocietyButton = {text: 'Search', disabled: false};
    };

    $scope.showCriteria = function() {
        $("#selected-criteria").toggleClass('hidden');
        $("#search-panel").toggleClass('col-md-9', 'col-md-12');
        if (!$("#selected-criteria").hasClass('hidden')) $scope.searchCriteria = "Hide selected search criteria";
        else $scope.searchCriteria = "View selected search criteria";
    };
    
    //removes a variable, language, or region from search parameters
    $scope.removeFromSearch = function(object, searchType) {
        var index = -1;
        switch(searchType) {
            case 'geographic':
                index = $scope.searchModel.getGeographicRegions().selectedRegions.indexOf(object);
                if (index > -1) {
                    $scope.searchModel.getGeographicRegions().selectedRegions.splice(index, 1);
                    $scope.searchModel.getGeographicRegions().badgeValue--;
                }
                break;
            case 'environmental':
                index = $scope.searchModel.getEnvironmentalData().selectedVariables.indexOf(object);
                if (index > -1) {
                    $scope.searchModel.getEnvironmentalData().selectedVariables.splice(index, 1);
                    $scope.searchModel.getEnvironmentalData().badgeValue = $scope.searchModel.getEnvironmentalData().selectedVariables.length;
                }
                break;
            case 'family':
                var langSelectedObjs = $scope.searchModel.getLanguageClassifications().selected;
                if (object in langSelectedObjs) {
                    for (var i = 0; i < langSelectedObjs[object].length; i++) {
                        langSelectedObjs[object][i].isSelected = false;
                        $scope.searchModel.getLanguageClassifications().badgeValue -= langSelectedObjs[object][i].societies.length
                    }
                    delete langSelectedObjs[object];
                }
                break;
            case 'language':
                var langSelectedObjs = $scope.searchModel.getLanguageClassifications().selected;
                if (object.family.name in langSelectedObjs) {
                    for (var i = 0; i < langSelectedObjs[object.family.name].length; i++) {
                        if (langSelectedObjs[object.family.name][i].id == object.id) {
                            langSelectedObjs[object.family.name][i].isSelected = false;
                            index = i;
                            break;
                        }
                    }
                    if (index > -1) {
                        langSelectedObjs[object.family.name].splice(index, 1);
                        $scope.searchModel.getLanguageClassifications().badgeValue -= object.societies.length;
                        if ($scope.searchModel.getLanguageClassifications().allClasses.selectedFamily && object.family.id == $scope.searchModel.getLanguageClassifications().allClasses.selectedFamily.id) 
                            $scope.searchModel.getLanguageClassifications().allClasses.languages.allSelected = false;
                    }
                }
                break;
            case 'code':
                object.isSelected = false;
                 if (object.type == 'c') {
                    variable = $scope.searchModel.getCulturalTraits().selectedVariables.map(function(v) { return v.id; }).indexOf(object.variable);
                    if (variable > -1) {
                        $scope.searchModel.getCulturalTraits().selectedVariables[variable].allSelected = false;
                        $scope.searchModel.getCulturalTraits().badgeValue--;
                    }
                } else if (object.type == 'e') {
                    variable = $scope.searchModel.getEnvironmentalData().selectedVariables.map(function(v) { return v.selectedVariable.id; }).indexOf(object.variable);
                    if (variable > -1) {
                        $scope.searchModel.getEnvironmentalData().selectedVariables[variable].selectedVariable.allSelected = false;
                    }
                }
                break;
            case 'variable':
               index = $scope.searchModel.getCulturalTraits().selectedVariables.map(function(v) { return v.id; }).indexOf(object.id);
               if (index > -1) {
                   if (object.data_type.toLowerCase() == 'continuous') {
                       $scope.searchModel.getCulturalTraits().badgeValue--;
                       $scope.searchModel.getCulturalTraits().selectedVariables.splice(index, 1);
                   } else {
                   for (var i = 0; i < $scope.searchModel.getCulturalTraits().selectedVariables[index].codes.length; i++) {
                        if ($scope.searchModel.getCulturalTraits().selectedVariables[index].codes[i].isSelected) {
                            $scope.searchModel.getCulturalTraits().selectedVariables[index].codes[i].isSelected = false;
                            $scope.searchModel.getCulturalTraits().badgeValue--;
                        }
                   }
                    $scope.searchModel.getCulturalTraits().selectedVariables[index].allSelected = false;
                   }
                    $scope.$broadcast('numVars');
               }
        }
        if (!$scope.searchModel.checkSelected()) {
            d3.select("#selected-criteria").classed("hidden", true);
            d3.select("#search-panel").classed("col-md-12", true);
            d3.select("#search-panel").classed("col-md-9", false);
            if (!$("#selected-criteria").hasClass('hidden')) $scope.searchCriteria = "Hide selected search criteria";
            else $scope.searchCriteria = "View selected search criteria";
        }
    };

    var errorCallBack = function() {
        $scope.errors = "Invalid input.";
        $scope.enableSearchButton();
    };
	
    var searchCompletedCallback = function() {
        $scope.enableSearchButton();
        searchModelService.searchCompletedCallback();
        $scope.switchToResults();
    };
    
    var searchBySocietyCallBack = function() {
        $scope.enableSearchButton();
        $scope.searchModel.results.searchedByName = true;
        if ($scope.searchModel.results.societies.length == 1) 
            $window.location.href = '/society/'+$scope.searchModel.results.societies[0].society.ext_id;
        else 
            $scope.switchToResults();
    };

    $scope.searchSocieties = function() {
        $scope.disableSearchButton();
        var query = $scope.searchModel.query;
        $scope.searchModel.results = FindSocieties.find(query, searchCompletedCallback, errorCallBack);
    };
    
    $scope.searchBySociety = function() {
        $scope.disableSearchButton();
        $scope.searchModel.query = {'name': $scope.model.societyQuery}
        $scope.searchModel.results = FindSocieties.find($scope.searchModel.query, searchBySocietyCallBack);
    };

    $scope.search = function() {
        var i;
        searchModel = searchModelService.getModel();
        searchParams = searchModel.params;   
        searchQuery = {};
        for (var propertyName in searchParams) {
            
            //get selected cultural traits/codes or environmental codes
           if (propertyName == 'culturalTraits' || propertyName == 'environmentalData') {
               searchParams[propertyName].selectedVariables.forEach(function(variable) {
                   filters = [];
                    selectedVariable = (propertyName == 'culturalTraits') ? variable : variable.selectedVariable;
                    if (!selectedVariable) return;
                   if (selectedVariable.data_type.toLowerCase() == 'continuous') {
                       filters = [
                        selectedVariable.id,
                        selectedVariable.selectedFilter.operator,
                        selectedVariable.vals
                       ]
                   } else {
                        selected_codes = selectedVariable.codes.filter(function (c) { return c.isSelected; }).map(function(c) { return c.id; });
                        if (selected_codes.length > 0) {
                            filters = [
                                selectedVariable.id,
                                'categorical',
                                selected_codes
                            ]
                        }
                   }
                   if (filters.length > 0) {
                    if (propertyName.charAt(0) in searchQuery) searchQuery[propertyName.charAt(0)].push(filters);
                    else searchQuery[propertyName.charAt(0)] = [filters]
                   }
               });
                
           }
            //get selected regions
            if (propertyName == 'geographicRegions') {
                var selectedRegions = searchParams[propertyName].selectedRegions;  
                selectedRegions.forEach(function (selectedRegion) {
                    searchParams[propertyName].allRegions.forEach(function(region) {
                        if (region.tdwg_code == selectedRegion.code)
                            selectedRegion.id = region.id;
                    });
                });
                if (selectedRegions.length > 0) {
                    searchQuery['p'] = [];
                    for (i = 0; i < selectedRegions.length; i++) {
                        searchQuery['p'].push(selectedRegions[i].id);
                    }
                }
            }
            //get selected languages
            if (propertyName == 'languageClassifications') { 
                var classifications = [];
                for (var family in searchParams[propertyName].selected) {
                    searchParams[propertyName].selected[family].forEach(function(language) { if (language.isSelected) classifications.push(language); });
                }
                if (classifications.length > 0) {
                    searchQuery['l'] = [];
                    for (i = 0; i < classifications.length; i++) {
                        searchQuery['l'].push(classifications[i].id);
                    }
                }
           }
        }
        searchModelService.updateSearchQuery(searchQuery);
        $scope.searchSocieties();
    };

    // resets this object state and the search query.
    $scope.resetSearch = function() {
        $scope.errors = "";
        $scope.enableSearchButton();
        $scope.searchModel.reset();
        // send a notification so that the individual controllers reload their state
        $scope.$broadcast('searchModelReset');
        // hide selected search criteria div if shown
        if (!$("#selected-criteria").hasClass('hidden')) {
            $scope.showCriteria();
        }
    };

}
/* Tests for search.js controller
Contains functions:
disableSearchButton - done
enableSearchButton - done
showCriteria - done
removeFromSearch - done
searchSocieties - done
searchBySociety - done
search - done
resetSearch - done

Private callback functions:
errorCallBack - done
searchCompletedCallback - done
searchBySocietyCallback - done
*/

describe('Testing search controller', function() {
    var compile, appScope, $window, mockAppCtrl, searchScope, mockSearchCtrl, mockSearchModelService, mockColorMapService, mockFindSocieties, searchBySocietyCallback;
    //for loading JSON data
    var queryDeferred, regions, languages, environmentals, culturals, results;

    beforeEach(function() {
        module('dplaceServices');
        module('dplace');
    });
    
    beforeEach(inject(function($compile, $httpBackend, $rootScope, $controller, searchModelService, colorMapService, FindSocieties, $q) {
        compile = $compile;
        $window = {location: {href:''}};
        results = {
            "sources": [
            {"id": 1,
            "name": "Binford"},
            {"id":2,
            "name": "EA"}
            ],
            "societies": [
                {"society":{"id":60,"ext_id":"Nb14","xd_id":"xd1073","hraf_link":"","name":"Comox","original_name":"Comox (Nb14)","alternate_names":"K'ómoks","location":{"coordinates":[-124.97,49.72]},"original_location":{"coordinates":[-125.0,50.0]},"language":{"id":59,"name":"Island Comox","glotto_code":"isla1276","iso_code":"","family":{"id":8,"name":"Salishan"}},"focal_year":"1880","source":{"id":1,"key":"ethnographicatlas","reference":"Murdock, G. P., R. Textor, H. Barry, III, D. R. White, J. P. Gray, and W. T. Divale. 1999. Ethnographic Atlas. World Cultures 10:24-136 (codebook)","name":"Ethnographic Atlas"},"region":{"id":36,"level_2_re":71.0,"count":4.0,"region_nam":"Western Canada","continent":"NORTHERN AMERICA","tdwg_code":71}},"variable_coded_values":[],"environmental_values":[]},
                {"society":{"id":167,"ext_id":"Nd36","xd_id":"xd1170","hraf_link":"Western (NT22)","name":"Wiyambituka","original_name":"Wiyambituka (Nd36)","alternate_names":"Morey Shoshoni, Great Smokey Valley Shoshoni, Little Smokey Valley Shoshoni","location":{"coordinates":[-117.0,39.0]},"original_location":{"coordinates":[-117.0,39.0]},"language":{"id":149,"name":"Western Shoshoni","glotto_code":"west2622","iso_code":"","family":{"id":25,"name":"Uto-Aztecan"}},"focal_year":"1870","source":{"id":1,"key":"ethnographicatlas","reference":"Murdock, G. P., R. Textor, H. Barry, III, D. R. White, J. P. Gray, and W. T. Divale. 1999. Ethnographic Atlas. World Cultures 10:24-136 (codebook)","name":"Ethnographic Atlas"},"region":{"id":41,"level_2_re":76.0,"count":4.0,"region_nam":"Southwestern U.S.A.","continent":"NORTHERN AMERICA","tdwg_code":76}},"variable_coded_values":[],"environmental_values":[]},
                {"society":{"id":1449,"ext_id":"B233","xd_id":"xd1170","hraf_link":"Western (NT22)","name":"Wiyambituka","original_name":"Little Smokey Shoshoni (B233)","alternate_names":"Morey Shoshoni, Great Smokey Valley Shoshoni, Little Smokey Valley Shoshoni","location":{"coordinates":[-115.84,39.33]},"original_location":{"coordinates":[-115.84,39.33]},"language":{"id":149,"name":"Western Shoshoni","glotto_code":"west2622","iso_code":"","family":{"id":25,"name":"Uto-Aztecan"}},"focal_year":"1860","source":{"id":2,"key":"binfordhuntergatherer","reference":"Binford, L. 2001. Constructing Frames of Reference: An Analytical Method for Archaeological Theory Building Using Hunter-gatherer and Environmental Data Sets. University of California Press","name":"Binford Hunter-Gatherer"},"region":{"id":41,"level_2_re":76.0,"count":4.0,"region_nam":"Southwestern U.S.A.","continent":"NORTHERN AMERICA","tdwg_code":76}},"variable_coded_values":[],"environmental_values":[]},
                {"society":{"id":1358,"ext_id":"B282","xd_id":"xd1073","hraf_link":"","name":"Comox","original_name":"Comox (B282)","alternate_names":"K'ómoks","location":{"coordinates":[-125.5,50.0]},"original_location":{"coordinates":[-125.5,50.0]},"language":{"id":59,"name":"Island Comox","glotto_code":"isla1276","iso_code":"","family":{"id":8,"name":"Salishan"}},"focal_year":"1860","source":{"id":2,"key":"binfordhuntergatherer","reference":"Binford, L. 2001. Constructing Frames of Reference: An Analytical Method for Archaeological Theory Building Using Hunter-gatherer and Environmental Data Sets. University of California Press","name":"Binford Hunter-Gatherer"},"region":{"id":36,"level_2_re":71.0,"count":4.0,"region_nam":"Western Canada","continent":"NORTHERN AMERICA","tdwg_code":71}},"variable_coded_values":[],"environmental_values":[]}
            ],
            "environmental_variables": [],
            "variable_descriptions": [],
            "geographic_regions": [],
            "languages": []
        }
        
        appScope = $rootScope.$new();
        searchScope = appScope.$new();
        queryDeferred = $q.defer();
        
        regions = window.__fixtures__['regions'];
		environmentals = window.__fixtures__['environmentals'];
		languages = window.__fixtures__['languages'];
		culturals = window.__fixtures__['culturals'];

        mockSearchModelService = searchModelService;
        mockAppCtrl = $controller('AppCtrl', {$scope: appScope, searchModelService: mockSearchModelService});
        spyOn(appScope, 'setActive');
        spyOn(appScope, 'switchToResults');
        
        mockColorMapService = colorMapService;
        mockFindSocieties = FindSocieties;
        
        mockSearchCtrl = $controller('SearchCtrl', {
            $scope: searchScope,
            colorMapService: mockColorMapService,
            searchModelService: mockSearchModelService,
            FindSocieties: mockFindSocieties,
            $window: $window
        });
        
        //spies for searchScope functions
        spyOn(searchScope, 'disableSearchButton').and.callThrough();
        spyOn(searchScope, 'searchBySociety').and.callThrough();
        spyOn(searchScope, 'enableSearchButton').and.callThrough();
        spyOn(searchScope, 'showCriteria').and.callThrough();
        spyOn(searchScope, 'search').and.callThrough();
        spyOn(mockSearchModelService, 'updateSearchQuery').and.callThrough();
        spyOn(searchScope, 'searchSocieties').and.callThrough();
        spyOn(mockSearchModelService, 'searchCompletedCallback');
        spyOn(mockSearchModelService.getModel(), 'reset');
        spyOn(appScope, '$broadcast');

        //expected requests
        $httpBackend.whenGET('/api/v1/categories?page_size=1000')
            .respond(200);
        $httpBackend.whenGET('/api/v1/get_dataset_sources')
            .respond(200);
        $httpBackend.whenGET('/api/v1/geographic_regions?page_size=1000')
            .respond(200);
        $httpBackend.whenGET('/api/v1/categories?page_size=1000&type=environmental')
            .respond(200);
        $httpBackend.whenGET('/api/v1/language_families?page_size=1000')
            .respond(200);
        $httpBackend.whenGET('/api/v1/languages?page_size=1000')
            .respond(200);
        $httpBackend.whenGET(/api\/v1\/find_societies\?.*/)
            .respond(200);
    }));
    
    
    it('should check starting values', function() {
        expect(searchScope.selectedButton).not.toBeDefined();
        expect(searchScope.searchButton.disabled).toBeFalsy();
        expect(searchScope.searchButton.text).toBe('Search');
        expect(searchScope.searchBySocietyButton.disabled).toBeFalsy();
        expect(searchScope.searchBySocietyButton.text).toBe('Search');
        expect(searchScope.searchCriteria).toBe('View selected search criteria');
    });
    
    it('should disable search button', function() {
        searchScope.disableSearchButton();
        searchScope.$digest();
        expect(searchScope.searchButton.disabled).toBeTruthy();
        expect(searchScope.searchButton.text).toBe('Working...');
        expect(searchScope.searchBySocietyButton.disabled).toBeTruthy();
        expect(searchScope.searchBySocietyButton.text).toBe('Working...');
    });
    
    it('should enable search button', function() {
        searchScope.searchButton = {disabled: true, text: 'Working...'};
        expect(searchScope.searchButton.disabled).toBeTruthy(); // first check button is disabled
        searchScope.enableSearchButton();
        expect(searchScope.searchButton.disabled).toBeFalsy();
        expect(searchScope.searchButton.text).toBe('Search');
        expect(searchScope.searchBySocietyButton.disabled).toBeFalsy();
        expect(searchScope.searchBySocietyButton.text).toBe('Search');
    });
    
    it('should check criteria pane', function() { //check toggle for search criteria pane
        //begins as hidden
        var elem = angular.element('<div id="selected-criteria" class="hidden">');
        angular.element(document.body).append(elem);
        elem = compile(elem)(appScope);
        appScope.$digest();
        searchScope.showCriteria();
        expect(elem.hasClass('hidden')).toBeFalsy();
        expect(searchScope.searchCriteria).toBe('Hide selected search criteria');
        searchScope.showCriteria();
        expect(elem.hasClass('hidden')).toBeTruthy();
        expect(searchScope.searchCriteria).toBe('View selected search criteria');
        elem.remove(); //remove so that this doesn't interfere with later test
    });
    
    
   // tests for removeFromSearch function
    it('should remove from geographic regions', function() {
        mockSearchModelService.getModel().getGeographicRegions().selectedRegions = [regions.Asia, regions.easternEurope];
        mockSearchModelService.getModel().getGeographicRegions().badgeValue = 2;
        //test removal of region that hasn't been selected - shouldn't do anything
        searchScope.removeFromSearch(regions.westernEurope, 'geographic')
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getGeographicRegions().badgeValue).toEqual(2);
        expect(mockSearchModelService.getModel().getGeographicRegions().selectedRegions.length).toEqual(2);
        //test removal of region that has been selected
        searchScope.removeFromSearch(mockSearchModelService.getModel().getGeographicRegions().selectedRegions[0], 'geographic');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getGeographicRegions().badgeValue).toEqual(1);
        expect(mockSearchModelService.getModel().getGeographicRegions().selectedRegions.length).toEqual(1);
    });
    
    it('should remove language family', function() {
        language1 = languages.language1;
        language2 = languages.language2;
        language3 = languages.language3;
        
        language1.isSelected = true;
        language2.isSelected = true;
        language3.isSelected = true;

        mockSearchModelService.getModel().getLanguageClassifications().selected = {
            'Austronesian': [language2, language3],
            'Family 1': [language1]
        };
        mockSearchModelService.getModel().getLanguageClassifications().badgeValue = 5;
        //test removal of family that hasn't been selected
        searchScope.removeFromSearch('Family 2', 'family');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getLanguageClassifications().badgeValue).toEqual(5);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Austronesian']).toEqual([language2, language3]);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Family 1']).toEqual([language1]);
        
        //test removal of family that has been selected
        searchScope.removeFromSearch('Austronesian', 'family');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getLanguageClassifications().badgeValue).toEqual(2);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Austronesian']).not.toBeDefined();
        expect(language2.isSelected).toBeFalsy();
        expect(language3.isSelected).toBeFalsy();
        expect(language1.isSelected).toBeTruthy();
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Family 1']).toBeDefined();
    });
    
    it('should remove language', function() {
        language1 = languages.language1;
        language2 = languages.language2;
        language3 = languages.language3;
        
        language1.isSelected = true;
        language2.isSelected = true;
        language3.isSelected = true;
        
        mockSearchModelService.getModel().getLanguageClassifications().selected = {
            'Austronesian': [language2, language3],
            'Family 1': [language1]
        };
        mockSearchModelService.getModel().getLanguageClassifications().badgeValue = 5;
        mockSearchModelService.getModel().getLanguageClassifications().allClasses.selectedFamily = language2.family;
        mockSearchModelService.getModel().getLanguageClassifications().allClasses.languages = {'allSelected': true};
        //test removing language that hasn't been selected -  nothing should change
        searchScope.removeFromSearch(
            {'family': { 'id': 58, 'name': 'Austronesian', 'scheme': 'G'}, 
            'id': 1121, 'name': 'Maori', 'societies': [5, 6, 7], 'isSelected':false}, 
        'language');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getLanguageClassifications().badgeValue).toEqual(5);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected).toEqual({
            'Austronesian': [language2, language3],
            'Family 1': [language1]
        });

        searchScope.removeFromSearch(language1, 'language');
        searchScope.$digest();
        expect(language1.isSelected).toBeFalsy();
        expect(mockSearchModelService.getModel().getLanguageClassifications().badgeValue).toEqual(3);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Family 1'].length).toEqual(0);
        //shouldn't change this, because the selected family is not the one removed from search
        expect(mockSearchModelService.getModel().getLanguageClassifications().allClasses.languages.allSelected).toBeTruthy();
        
        //test setting allSelected false
        searchScope.removeFromSearch(language2, 'language');
        searchScope.$digest();
        expect(language2.isSelected).toBeFalsy();
        expect(language3.isSelected).toBeTruthy();
        expect(mockSearchModelService.getModel().getLanguageClassifications().badgeValue).toEqual(2);
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected['Austronesian']).toEqual([language3]);
        expect(mockSearchModelService.getModel().getLanguageClassifications().allClasses.languages.allSelected).toBeFalsy();
    });
        
    it('should remove environmental variable', function() {
        var to_remove = environmentals.variables.continuousEnvVar;
        mockSearchModelService.getModel().getEnvironmentalData().selectedVariables = [to_remove, environmentals.variables.categoricalEnvVar];
        mockSearchModelService.getModel().getEnvironmentalData().badgeValue = 2;
        searchScope.removeFromSearch(to_remove, 'environmental');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables.length).toEqual(1);
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables.indexOf(to_remove)).toEqual(-1);
        expect(mockSearchModelService.getModel().getEnvironmentalData().badgeValue).toEqual(1);
        
        //test removal of variable that doesn't exist
        searchScope.removeFromSearch(to_remove, 'environmental');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables.length).toEqual(1);
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables.indexOf(to_remove)).toEqual(-1);
        expect(mockSearchModelService.getModel().getEnvironmentalData().badgeValue).toEqual(1);
    });
    
    it('should remove code from environmental search', function() {
        //the variables in environmentals.json are formatted for results not for search, so we must get the variable and codes separately
        env_variable = environmentals.variables.categoricalEnvVar.variable;
        env_variable.allSelected = true;
        env_variable.codes = environmentals.variables.categoricalEnvVar.codes;
        env_variable.codes.forEach(function(c) {
            c.isSelected = true;
        });

        mockSearchModelService.getModel().getEnvironmentalData().selectedVariables = [
            {'selectedVariable': env_variable}
        ]
        searchScope.removeFromSearch(env_variable.codes[2], 'code');
        searchScope.$digest();
        expect(env_variable.codes[2].isSelected).toBeFalsy();
        expect(env_variable.allSelected).toBeFalsy();
    });
    
    it('should remove code from cultural search', function() {
        variable_description = culturals.variables.categoricalCulturalVar.variable;
        variable_description.allSelected = true;
        variable_description.codes = culturals.variables.categoricalCulturalVar.codes;
        variable_description.codes.forEach(function(c){
            c.isSelected = true;
            c.type = "c";
            c.variable = variable_description.id;
        });
        mockSearchModelService.getModel().getCulturalTraits().selectedVariables = [variable_description]
        mockSearchModelService.getModel().getCulturalTraits().badgeValue = 5;
        searchScope.removeFromSearch(variable_description.codes[1], 'code');
        searchScope.$digest();
        expect(variable_description.codes[1].isSelected).toBeFalsy();
        expect(variable_description.allSelected).toBeFalsy();
        expect(mockSearchModelService.getModel().getCulturalTraits().badgeValue).toEqual(4);
    });
    
    it('should remove variable', function() {
        variable_description = culturals.variables.categoricalCulturalVar.variable;
        variable_description.allSelected = true;
        variable_description.codes = culturals.variables.categoricalCulturalVar.codes;
        variable_description.codes.forEach(function(c){
            c.isSelected = true;
            c.type = "c";
            c.variable = variable_description.id;
        });
        continuous_variable = culturals.variables.continuousCulturalVar.variable;
        mockSearchModelService.getModel().getCulturalTraits().selectedVariables = [continuous_variable, variable_description];
        mockSearchModelService.getModel().getCulturalTraits().badgeValue = 6;
        searchScope.removeFromSearch(variable_description, 'variable');
        searchScope.$digest();
        for (var c = 0; c < variable_description.codes.length; c++) {
            expect(variable_description.codes[c].isSelected).toBeFalsy();
        }
        expect(variable_description.allSelected).toBeFalsy();
        expect(mockSearchModelService.getModel().getCulturalTraits().badgeValue).toEqual(1);
        searchScope.removeFromSearch(variable_description, 'variable');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getCulturalTraits().badgeValue).toEqual(1);
        searchScope.removeFromSearch(continuous_variable, 'variable');
        searchScope.$digest();
        expect(mockSearchModelService.getModel().getCulturalTraits().badgeValue).toEqual(0);
        expect(mockSearchModelService.getModel().getCulturalTraits().selectedVariables.indexOf(continuous_variable)).toEqual(-1);
    });
    
    it('should search by society name + return many societies', function() {
        //mock the successful return of the data from FindSocieties.find(). 
        //callbackFxn is searchbySocietyCallBack in search.js.
        //call it manually here, upon successful resolve
        spyOn(mockFindSocieties, 'find').and.callFake(function(queryTerms, callbackFxn) {
            queryDeferred.promise.then(function(r) {
                searchScope.searchModel.results = r; 
                callbackFxn();
            });
            queryDeferred.resolve(results);
            appScope.$apply();
            return searchScope.searchModel.results; //return the results to searchScope
        });

        searchScope.model.societyQuery = 'mo';
        searchScope.searchBySociety();
        expect(searchScope.disableSearchButton).toHaveBeenCalled();
        expect(searchScope.searchModel.query).toEqual({'name': 'mo'});
        expect(mockFindSocieties.find).toHaveBeenCalled();
        //check callback function
        expect(searchScope.enableSearchButton).toHaveBeenCalled();
        expect(searchScope.searchModel.results.searchedByName).toBeDefined();
        expect(searchScope.searchModel.results.searchedByName).toBeTruthy();
        expect(appScope.switchToResults).toHaveBeenCalled(); //more than one society returned, so should switch to results page
        //hack to get the function below to return only one society
        alreadyCalledOnce = true;
    });
    
    it('should search by society name + return one society', function() {
        //mock the successful return of the data from FindSocieties.find(). 
        //callbackFxn is searchbySocietyCallBack in search.js.
        //call it manually here, upon successful resolve
        spyOn(mockFindSocieties, 'find').and.callFake(function(queryTerms, callbackFxn) {
            results.societies = [results.societies[0]];
            
            queryDeferred.promise.then(function(r) {
                searchScope.searchModel.results = r; 
                callbackFxn();
            });
            queryDeferred.resolve(results);
            appScope.$apply();
            return searchScope.searchModel.results; //return the results to searchScope
        });

        searchScope.model.societyQuery = 'Comox';
        searchScope.searchBySociety();
        expect(searchScope.disableSearchButton).toHaveBeenCalled();
        expect(searchScope.searchModel.query).toEqual({'name': 'Comox'});
        expect(mockFindSocieties.find).toHaveBeenCalled();
        //check callback function
        expect(searchScope.enableSearchButton).toHaveBeenCalled();
        expect(searchScope.searchModel.results.searchedByName).toBeDefined();
        expect(searchScope.searchModel.results.searchedByName).toBeTruthy();
        //should go straight to page because only one society returned
        expect(appScope.switchToResults).not.toHaveBeenCalled();
        expect($window.location.href).toEqual('/society/Nb14');
    });
    
    it('should search by society name + return no societies', function() {
        //mock the successful return of the data from FindSocieties.find(). 
        //callbackFxn is searchbySocietyCallBack in search.js.
        //call it manually here, upon successful resolve
        spyOn(mockFindSocieties, 'find').and.callFake(function(queryTerms, callbackFxn) {
            results.societies = [];
            
            queryDeferred.promise.then(function(r) {
                searchScope.searchModel.results = r; 
                callbackFxn();
            });
            queryDeferred.resolve(results);
            appScope.$apply();
            return searchScope.searchModel.results; //return the results to searchScope
        });

        searchScope.model.societyQuery = 'qwerty';
        searchScope.searchBySociety();
        expect(searchScope.disableSearchButton).toHaveBeenCalled();
        expect(searchScope.searchModel.query).toEqual({'name': 'qwerty'});
        expect(mockFindSocieties.find).toHaveBeenCalled();
        //check callback function
        expect(searchScope.enableSearchButton).toHaveBeenCalled();
        expect(searchScope.searchModel.results.searchedByName).toBeDefined();
        expect(searchScope.searchModel.results.searchedByName).toBeTruthy();
        expect(appScope.switchToResults).toHaveBeenCalled();
    });
    
    //test successful search
    it('should search for societies', function() {
        spyOn(mockFindSocieties, 'find').and.callFake(function(queryTerms, callbackFxn, errorFxn) {
            queryDeferred.promise.then(function(r) {
               searchScope.searchModel.results = r;
               callbackFxn();
            });
            queryDeferred.resolve(results); //we test searchCompletedCallback in the searchModelService test, so we'll just resolve the promise here to test controller logic
            appScope.$apply();
            return searchScope.searchModel.results;
        });
        
        searchScope.searchModel.query = {'p': [regions.Asia.id, regions.easternEurope.id]}
        searchScope.searchSocieties();
        expect(searchScope.disableSearchButton).toHaveBeenCalled();
        expect(mockFindSocieties.find).toHaveBeenCalled();
        //check callback function
        expect(searchScope.enableSearchButton).toHaveBeenCalled();
        expect(mockSearchModelService.searchCompletedCallback).toHaveBeenCalled();
        expect(appScope.switchToResults).toHaveBeenCalled();
    });
    
    //test error callback
    it('should not search for societies', function() {
        spyOn(mockFindSocieties, 'find').and.callFake(function(queryTerms, callbackFxn, errorFxn) {
            queryDeferred.promise.then(function(r) {
               searchScope.searchModel.results = r;
               callbackFxn();
            }, function(err) {
                errorFxn();
            });
            queryDeferred.reject(); //we test searchCompletedCallback in the searchModelService test, so we'll just resolve the promise here to test controller logic
            appScope.$apply();
            return searchScope.searchModel.results;
        });
        
        searchScope.searchModel.query = {'p': [regions.Asia.id, regions.easternEurope.id]}
        searchScope.searchSocieties();
        expect(searchScope.disableSearchButton).toHaveBeenCalled();
        expect(mockFindSocieties.find).toHaveBeenCalled();
        //check callback function
        expect(searchScope.enableSearchButton).toHaveBeenCalled();
        expect(searchScope.errors).toEqual("Invalid input.");
        expect(mockSearchModelService.searchCompletedCallback).not.toHaveBeenCalled();
        expect(appScope.switchToResults).not.toHaveBeenCalled();
    });
    

    it('should update search query + search', function() {
        //set up search parameters - geographic regions
        mockSearchModelService.getModel().getGeographicRegions().allRegions = [regions.Africa, regions.easternEurope, regions.Asia, regions.westernEurope];
        mockSearchModelService.getModel().getGeographicRegions().selectedRegions = [regions.Asia, regions.easternEurope];
        
        //set up search parameters - languages
        language1.isSelected = true; 
        language2.isSelected = true;
        language3.isSelected = true;
        mockSearchModelService.getModel().getLanguageClassifications().selected = {
            'Austronesian': [language2, language3],
            'Family 1': [language1]
        };
        
        //set up search parameters - environmental variables 
        continuousVar = environmentals.variables.continuousEnvVar.variable;
        continuousVar.selectedFilter = {'operator': 'inrange'};
        continuousVar.vals = ['0', '150.2'];
        
        env_variable = environmentals.variables.categoricalEnvVar.variable;
        env_variable.allSelected = true;
        env_variable.codes = environmentals.variables.categoricalEnvVar.codes;
        env_variable.codes.forEach(function(c) {
            c.isSelected = true;
        });
        mockSearchModelService.getModel().getEnvironmentalData().selectedVariables = [
            {'selectedVariable': env_variable},
            {'selectedVariable': continuousVar}
        ]
        
        //set up search parameters - cultural variables
        variable_description = culturals.variables.categoricalCulturalVar.variable;
        variable_description.allSelected = true;
        variable_description.codes = culturals.variables.categoricalCulturalVar.codes;
        variable_description.codes.forEach(function(c){
            c.isSelected = true;
        });
        continuous_variable = culturals.variables.continuousCulturalVar.variable;
        continuous_variable.selectedFilter = {'operator': 'gt'};
        continuous_variable.vals = ['500', '10000'];
        mockSearchModelService.getModel().getCulturalTraits().selectedVariables = [continuous_variable, variable_description];
        
        expected_searchQuery = {
            'e': [[env_variable.id, 'categorical', env_variable.codes.map(function(m) { return m.id; })], [continuousVar.id, 'inrange', continuousVar.vals]],
            'p': [regions.Asia.id, regions.easternEurope.id],
            'l': [language2.id, language3.id, language1.id],
            'c': [[continuous_variable.id, 'gt', continuous_variable.vals], [variable_description.id, 'categorical', variable_description.codes.map(function(m) { return m.id; })]]
        }
        searchScope.search();
        expect(mockSearchModelService.updateSearchQuery).toHaveBeenCalledWith(expected_searchQuery);
        expect(searchScope.searchSocieties).toHaveBeenCalled();
    });

    it('should reset search', function() {
        searchScope.errors = "dlfkjdlakfj"; //text string
        searchScope.searchButton.disabled = true;
        searchScope.searchButton.text = "Working...";
        
        var elem = angular.element('<div id="selected-criteria" class="show">');
        angular.element(document.body).append(elem);
        elem = compile(elem)(appScope);
        appScope.$digest();
        
        searchScope.resetSearch();
        expect(searchScope.errors).toBe("");
        expect(searchScope.enableSearchButton).toHaveBeenCalled();
        expect(mockSearchModelService.getModel().reset).toHaveBeenCalled();
        expect(searchScope.showCriteria).toHaveBeenCalled();
        expect(appScope.$broadcast).toHaveBeenCalledWith('searchModelReset');
       
    });
    
})

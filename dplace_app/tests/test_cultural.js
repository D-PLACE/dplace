describe('Testing cultural controller', function() {
    var culturals, appScope, mockAppCtrl, searchScope, culturalScope, mockSearchCtrl, mockCulturalCtrl, mockSearchModelService, mockColorMapService, mockFindSocieties;
  
    beforeEach(function() {
        module('dplaceServices');
        module('dplace');
    });
    
    beforeEach(inject(function($rootScope, $controller, searchModelService, colorMapService, FindSocieties, $httpBackend) {
        appScope = $rootScope.$new();

        mockSearchModelService = searchModelService;
        mockAppCtrl = $controller('AppCtrl', {$scope: appScope, searchModelService: mockSearchModelService});
        mockColorMapService = colorMapService;
        mockFindSocieties = FindSocieties;
		searchScope = appScope.$new();
        mockSearchCtrl = $controller('SearchCtrl', {
            $scope: searchScope,
            colorMapService: mockColorMapService,
            searchModelService: mockSearchModelService,
            FindSocieties: mockFindSocieties
        });
        spyOn(searchScope, 'resetSearch').and.callThrough();
        
        culturalScope = searchScope.$new();
        mockCulturalCtrl = $controller('CulturalCtrl', {
            $scope: culturalScope,
            searchModelService: mockSearchModelService
        });
        spyOn(culturalScope, 'numVars').and.callThrough();
        
        culturals = window.__fixtures__['culturals'];

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
    }));
    
    it('check that everything is defined', function() {
        expect(culturalScope.traits).toBeDefined();
        expect(culturalScope.numVars).toBeDefined();
        expect(culturalScope.numSelectedVars).toBeDefined();
        expect(culturalScope.numSelectedVars).toEqual(0);
    });
    
    it('should keep track of number of variables selected correctly', function() {
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
        
        culturalScope.numVars();
        expect(culturalScope.numSelectedVars).toEqual(2);
        
        //add another variable
        ordinal_variable = culturals.variables.ordinalCulturalVar.variable;
        ordinal_variable.allSelected = false;
        ordinal_variable.codes = culturals.variables.ordinalCulturalVar.codes;
        ordinal_variable.codes[0].isSelected = true;
        mockSearchModelService.getModel().getCulturalTraits().selectedVariables.push(ordinal_variable);
        culturalScope.numVars();
        expect(culturalScope.numSelectedVars).toEqual(3);
        
        //deselect codes but keep variable there - this variable shouldn't get counted
        ordinal_variable.codes[0].isSelected = false;
        culturalScope.numVars();
        expect(culturalScope.numSelectedVars).toEqual(2);
        
        //add a variable but without codes - this variable shouldn't get counted
        mockSearchModelService.getModel().getCulturalTraits().selectedVariables.push(culturals.variables.categoricalCulturalVar2.variable)
        culturalScope.numVars();
        expect(culturalScope.numSelectedVars).toEqual(2);
    });
    
    it('should reset error message if number of selected variables < 5', function() {
        searchScope.searchButton.errors = "dsfkljadslfkjdla"; //doesn't matter, set anything
        
        variable_description = culturals.variables.categoricalCulturalVar.variable;
        variable_description.allSelected = true;
        variable_description.codes = culturals.variables.categoricalCulturalVar.codes;
        variable_description.codes.forEach(function(c){
            c.isSelected = true;
            c.type = "c";
            c.variable = variable_description.id;
        });
        
        //just add > 5 variables
        mockSearchModelService.getModel().getCulturalTraits().selectedVariables = [
            variable_description, 
            variable_description, 
            variable_description, 
            culturals.variables.continuousCulturalVar.variable,
            culturals.variables.continuousCulturalVar.variable,
            culturals.variables.continuousCulturalVar.variable,
            culturals.variables.continuousCulturalVar.variable
        ];
        
        culturalScope.numVars();
        expect(culturalScope.numSelectedVars).toEqual(7);
        expect(searchScope.searchButton.errors).toEqual("dsfkljadslfkjdla");
        
        //remove variables so there are less than 5
        for (var i = 0; i < 2; i++) {
            mockSearchModelService.getModel().getCulturalTraits().selectedVariables.pop();
            expect(searchScope.searchButton.errors).toEqual("dsfkljadslfkjdla"); //shouldn't reset yet
        }
        mockSearchModelService.getModel().getCulturalTraits().selectedVariables.pop();
        culturalScope.numVars();
        expect(culturalScope.numSelectedVars).toEqual(4);
        expect(searchScope.searchButton.errors).toEqual("");
    });
    
    it('should call linkModel on reset', function() {
        //set some arbitrary values
        mockSearchModelService.getModel().getCulturalTraits().selectedVariables = [
            {"id": 1, "name": "Test 1"},
            {"id": 2, "name": "Test 2"},
            {"id": 3, "name": "Test 3"}
        ];
        culturalScope.numSelectedVars = 10;
        searchScope.searchButton.errors = "dsfkljadslfkjdla";
        
        searchScope.resetSearch();
        searchScope.$digest();
        
        //check values have been reset
        expect(mockSearchModelService.getModel().getCulturalTraits().selectedVariables).toEqual([]);
        expect(mockSearchModelService.getModel().getCulturalTraits().selectedCategory).toEqual(null);
        expect(mockSearchModelService.getModel().getCulturalTraits().selectedVariable).toEqual(null);
        expect(mockSearchModelService.getModel().getCulturalTraits().badgeValue).toEqual(0);
        expect(culturalScope.traits[0]).toEqual(mockSearchModelService.getModel().getCulturalTraits());
        
        //check reset of variable count
        expect(culturalScope.numVars).toHaveBeenCalled();
        expect(culturalScope.numSelectedVars).toEqual(0);
        
        //check reset of errors
        expect(searchScope.searchButton.errors).toEqual("");
    });
});

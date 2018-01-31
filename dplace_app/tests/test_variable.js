/* 

Tests VariableSearchCtrl for cultural variable search.
Functions:

linkModel
sourceChanged - done
categoryChanged - done
variableChanged
codeSelected
filterChanged
selectAll

*/

describe('Testing variable controller for cultural variables', function() {
    var httpBackend, appScope, mockSearchModelService, mockAppCtrl, mockFindSocieties, mockColorMapService, 
    mockGetCategories, mockVariable, mockMinNMax, mockCodeDescription,searchScope, mockSearchCtrl, variableScope, 
    mockVariableCtrl, mockCulturalCtrl, culturalScope, culturals;
    
    beforeEach(function() {
        module('dplaceServices');
        module('dplace');
    });
    
    beforeEach(inject(function($rootScope, $controller, searchModelService, colorMapService, FindSocieties, getCategories, Variable, MinAndMax, CodeDescription, $httpBackend) {
        
        appScope = $rootScope.$new();
        
        mockSearchModelService = searchModelService;
        mockAppCtrl = $controller('AppCtrl', {$scope: appScope, searchModelService: mockSearchModelService});
        mockFindSocieties = FindSocieties;
        mockGetCategories = getCategories;
        mockVariable = Variable;
        mockMinNMax = MinAndMax;
        mockCodeDescription = CodeDescription;
        
		searchScope = appScope.$new();
        mockSearchCtrl = $controller('SearchCtrl', {
            $scope: searchScope,
            colorMapService: mockColorMapService,
            searchModelService: mockSearchModelService,
            FindSocieties: mockFindSocieties
        });

        culturalScope = searchScope.$new();
        mockCulturalCtrl = $controller('CulturalCtrl', {
            $scope: culturalScope,
            searchModelService: mockSearchModelService
        });
        
        
        mockSearchModelService.model.searchParams = {
            'selectedButton': {'value': 'cultural'}
        }; // pretend we selected cultural variable search
        

        variableScope = culturalScope.$new();
        
        mockVariableCtrl = $controller('VariableSearchCtrl', {
            $scope: variableScope,
            searchModelService: mockSearchModelService,
            getCategories: mockGetCategories,
            Variable: mockVariable,
            MinAndMax: mockMinNMax,
            CodeDescription: mockCodeDescription
        });
        
        spyOn(mockGetCategories, 'query').and.callThrough();
        spyOn(mockVariable, 'query').and.callThrough();
        spyOn(mockCodeDescription, 'query').and.callThrough();
        spyOn(mockMinNMax, 'query').and.callThrough();
        spyOn(variableScope, 'filterChanged').and.callThrough();
        spyOn(variableScope, 'codeSelected').and.callThrough();
        spyOn(culturalScope, 'numVars');
        
        culturals = window.__fixtures__['culturals'];
        
        httpBackend = $httpBackend;
        
        /* returns empty data */
        $httpBackend.whenGET('/api/v1/geographic_regions?page_size=1000')
            .respond(JSON.stringify({"results": [], "count": 0}));
        $httpBackend.whenGET('/api/v1/categories?page_size=1000&type=environmental')
            .respond(JSON.stringify({"results": [], "count": 0}));
        $httpBackend.whenGET('/api/v1/language_families?page_size=1000')
            .respond(JSON.stringify({"results": [], "count": 0}));
        $httpBackend.whenGET('/api/v1/languages?page_size=1000')
            .respond(JSON.stringify({"results": [], "count": 0}));  
            
        /* returns data for testing */
        $httpBackend.whenGET('/api/v1/get_categories?query='+encodeURI('{"source":1}'))
            .respond([
                {'id': 1, 'name': 'Subsistence'}, 
                {'id': 3, 'name': 'Kinship'},
                {'id': 6, 'name': 'Population'},
                {'id': 10, 'name': 'Class'}
            ]);
        $httpBackend.whenGET('/api/v1/get_dataset_sources')
            .respond([
                {"id": 1, "name": "Ethnographic Atlas"}, 
                {"id": 2,"name": "Binford Hunter-Gatherer"}
            ]);
        $httpBackend.whenGET('/api/v1/variables?index_categories=10&page_size=1000&source=1')
            .respond(JSON.stringify({
                "count": 3,
                "results":  [
                    {   
                        "id": 95,
                        "label": "T001",
                        "name": "Subsistence economy",
                        "data_type": "Continuous",
                        "source": 1,
                        "index_categories": [ 10, 5]
                    },
                    {   
                        "id": 96,
                        "label": "T002",
                        "name": "Population",
                        "data_type": "Continuous",
                        "source": 1,
                        "index_categories": [ 10 ]
                    },
                    {   
                        "id": 97,
                        "label": "T003",
                        "name": "Slavery",
                        "data_type": "Categorical",
                        "source": 1,
                        "index_categories": [ 2, 10 ]
                    }
                ]
            }));
            
        $httpBackend.whenGET('/api/v1/codes/?variable=95&page_size=1000')
            .respond(JSON.stringify({
                "count": 5,
                "results": culturals.variables.categoricalCulturalVar.codes
            }));
        $httpBackend.whenGET(/api\/v1\/min_and_max\?.*/)
            .respond(JSON.stringify({
                'min': -17,
                'max': 35
            }));
            
        $httpBackend.flush();

    }));
    
    it('check that everything is defined', function() {
        //objects
        expect(variableScope.filters).toBeDefined();
        expect(variableScope.variables).toBeDefined();
        
        //functions
        expect(variableScope.sourceChanged).toBeDefined();
        expect(variableScope.categoryChanged).toBeDefined();
        expect(variableScope.variableChanged).toBeDefined();
        expect(variableScope.codeSelected).toBeDefined();
        expect(variableScope.filterChanged).toBeDefined();
        expect(variableScope.selectAll).toBeDefined();
    });
    
    it('check starting values', function() {        
        expect(variableScope.variables).toEqual([mockSearchModelService.getModel().getCulturalTraits()]);
        expect(variableScope.variables[0].sources.map(function(s) { return {"id": s.id, "name": s.name}; })).toEqual([{"id": 1, "name": "Ethnographic Atlas"}, {"id": 2,"name": "Binford Hunter-Gatherer"}]);
    });
    
    it('should get categories after source is selected', function() {
        variableScope.variables[0].selectedSource = {"id": 1};
        expect(variableScope.variables[0].categories.length).toEqual(0); //check empty
        variableScope.sourceChanged(variableScope.variables[0]);
        httpBackend.flush();
        expect(mockGetCategories.query).toHaveBeenCalled();
        expect(mockGetCategories.query).toHaveBeenCalledWith({query: {source: 1}});
        expect(variableScope.variables[0].categories.length).toEqual(4);
        expect(variableScope.variables[0].categories.map(function(c) { return {"id": c.id, "name": c.name};})).toEqual([
            {'id': 1, 'name': 'Subsistence'}, 
            {'id': 3, 'name': 'Kinship'},
            {'id': 6, 'name': 'Population'},
            {'id': 10, 'name': 'Class'}
        ]);
    });
    
    it('should get variables when a category is selected', function() {
        variableScope.variables[0].selectedCategory = {'id': 10, 'name': 'Class'};
        variableScope.variables[0].selectedSource = {"id": 1};
        variableScope.categoryChanged(variableScope.variables[0]);
        httpBackend.flush();
        expect(mockVariable.query).toHaveBeenCalled();
        expect(mockVariable.query).toHaveBeenCalledWith({ index_categories: 10, source: 1});
        expect(variableScope.variables[0].indexVariables.length).toEqual(3);
        expect(variableScope.variables[0].indexVariables.map(function(v) { return v.id;})).toEqual([95, 96, 97]);
    });
    
    /* test variable selection */
    it('should not do anything if no variable is selected', function() {
        variableScope.variables[0].selectedVariable = null;
        variableScope.variableChanged(variableScope.variables[0]);
        
        //check that nothing happened
        expect(variableScope.values).not.toBeDefined();
        expect(mockMinNMax.query).not.toHaveBeenCalled();
        expect(variableScope.variables[0].selectedVariables.length).toEqual(0);
        expect(mockSearchModelService.getModel().getCulturalTraits().badgeValue).toEqual(0);
        expect(variableScope.filterChanged).not.toHaveBeenCalled();
        expect(mockCodeDescription.query).not.toHaveBeenCalled();
        expect(variableScope.codeSelected).not.toHaveBeenCalled();
        expect(culturalScope.numVars).toHaveBeenCalled();
    });
    
    it('should get codes for selected cultural categorical variable when selected for the first time', function() {
        variableScope.variables[0].selectedVariable = {'id': 95, 'data_type': 'Categorical'};
        variableScope.variableChanged(variableScope.variables[0]);
        httpBackend.flush();
        expect(mockCodeDescription.query).toHaveBeenCalled();
        expect(mockCodeDescription.query).toHaveBeenCalledWith({variable: 95});
        expect(variableScope.variables[0].selectedVariable.codes.length).toEqual(5);
        expect(variableScope.codeSelected.calls.count()).toEqual(5);
        variableScope.variables[0].selectedVariable.codes.forEach(function(c) {
            expect(c.isSelected).toBeTruthy();
        });
        expect(variableScope.variables[0].allSelected).toBeTruthy();
        expect(variableScope.variables[0].selectedVariables.length).toEqual(1);
        expect(variableScope.variables[0].selectedVariables[0]).toEqual(variableScope.variables[0].selectedVariable);
        expect(culturalScope.numVars).toHaveBeenCalled();
        
        //shouldn't do these - these are for continuous variables
        expect(variableScope.filterChanged).not.toHaveBeenCalled();
        expect(mockMinNMax.query).not.toHaveBeenCalled();
        expect(variableScope.values).not.toBeDefined();
    });
    
    it('should not get codes again', function() {
        variableScope.variables[0].selectedVariables = [culturals.variables.categoricalCulturalVar.variable];
        variableScope.variables[0].selectedVariables[0].codes = culturals.variables.categoricalCulturalVar.codes;
        for (var i = 0; i < 4; i++) {
            variableScope.variables[0].selectedVariables[0].codes[i].isSelected = true;
        }
        variableScope.variables[0].selectedVariables[0].codes[4].isSelected = false;
        variableScope.variables[0].selectedVariables[0].allSelected = false;
        
        mockSearchModelService.getModel().getCulturalTraits().selectedVariable = variableScope.variables[0].selectedVariables[0];
        variableScope.variableChanged(variableScope.variables[0]);
        //check that nothing happened
        expect(variableScope.values).not.toBeDefined();
        expect(mockMinNMax.query).not.toHaveBeenCalled();
        expect(variableScope.variables[0].selectedVariables.length).toEqual(1);
        expect(variableScope.filterChanged).not.toHaveBeenCalled();
        expect(mockCodeDescription.query).not.toHaveBeenCalled();
        expect(variableScope.codeSelected).not.toHaveBeenCalled();
        expect(culturalScope.numVars).toHaveBeenCalled();
        expect(variableScope.variables[0].selectedVariables[0].codes[4].isSelected).toBeFalsy();
        expect(variableScope.variables[0].selectedVariables[0].allSelected).toBeFalsy();
    });

    it('should get starting values for continuous variable', function() {
        variableScope.variables[0].selectedVariable = culturals.variables.continuousCulturalVar.variable;
        variableScope.variables[0].VariableForm = { $setPristine: function() {} };
        spyOn(variableScope.variables[0].VariableForm, '$setPristine');
        variableScope.variableChanged(variableScope.variables[0]);
        httpBackend.flush();
        expect(mockMinNMax.query).toHaveBeenCalled();
        expect(mockMinNMax.query).toHaveBeenCalledWith({query: {id: 66}});
        expect(variableScope.values.min).toBeDefined();
        expect(variableScope.values.min).toEqual(-17);
        expect(variableScope.values.max).toBeDefined();
        expect(variableScope.values.max).toEqual(35);
        expect(variableScope.variables[0].selectedVariable.selectedFilter).toEqual({ operator: 'inrange', name: 'between' });
        expect(variableScope.variables[0].VariableForm.$setPristine).toHaveBeenCalled();
        expect(variableScope.variables[0].selectedVariables.length).toEqual(1);
        expect(variableScope.variables[0].selectedVariables[0]).toEqual(variableScope.variables[0].selectedVariable);
        expect(mockSearchModelService.getModel().getCulturalTraits().badgeValue).toEqual(1);
        expect(variableScope.filterChanged).toHaveBeenCalled();
    });
});

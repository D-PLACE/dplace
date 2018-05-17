describe('Testing environmental controller', function() {
    var environmentals, appScope, mockAppCtrl, searchScope, environmentalScope, mockSearchCtrl, mockEnvironmentalCtrl, mockSearchModelService, mockColorMapService, mockFindSocieties;
  
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
        
        environmentalScope = searchScope.$new();
        
        mockEnvironmentalCtrl = $controller('EnvironmentalCtrl', {
            $scope: environmentalScope,
            searchModelService: mockSearchModelService
        });
        
        spyOn(environmentalScope, 'addVariable').and.callThrough();

        environmentals = window.__fixtures__['environmentals'];

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
    
    it('should check that everything is defined', function() {
        expect(environmentalScope.addVariable).toBeDefined();       
    });
    
    it('should add variable', function() {
        expected = {'vals': ['', ''], 
            'selectedFilter': mockSearchModelService.getModel().getEnvironmentalData().filters[0],
            'categories': mockSearchModelService.getModel().getEnvironmentalData().categories
        };
        //should start with length 1
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables.length).toEqual(1);
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables[0]).toEqual(expected)
        environmentalScope.addVariable(); //test adding variable
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables.length).toEqual(2);
    });
    
    /*it('should do search', function() {
        //set selected variables
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
        environmentalScope.search();
        expected_searchQuery = {
            'e': [[env_variable.id, 'categorical', env_variable.codes.map(function(m) { return m.id; })], [continuousVar.id, 'inrange', continuousVar.vals]]
        }
        expect(mockSearchModelService.updateSearchQuery).toHaveBeenCalled();
        expect(mockSearchModelService.updateSearchQuery).toHaveBeenCalledWith(expected_searchQuery);
        expect(searchScope.searchSocieties).toHaveBeenCalled();
    });*/
    
    it('should run linkModel after reset', function() {
        //set arbitrary values
        mockSearchModelService.getModel().getEnvironmentalData().selectedVariables = [5, 6, 7, 8];
        mockSearchModelService.getModel().getEnvironmentalData().badgeValue = 4;
        searchScope.resetSearch();
        searchScope.$digest();
        
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables.length).toEqual(1);
        expect(mockSearchModelService.getModel().getEnvironmentalData().badgeValue).toEqual(0);
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables[0].vals).toEqual(['','']);
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables[0].selectedFilter).toEqual({ operator: 'inrange', name: 'between' });
        expect(mockSearchModelService.getModel().getEnvironmentalData().selectedVariables[0].categories).toEqual(mockSearchModelService.getModel().getEnvironmentalData().categories);
        expect(environmentalScope.addVariable).toHaveBeenCalled();
    });

});

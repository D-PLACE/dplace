describe('Testing geographic search', function() {
    var regions, appScope, mockAppCtrl, searchScope, geographicScope, mockSearchCtrl, mockGeographicCtrl, mockSearchModelService, mockColorMapService, mockFindSocieties;
    beforeEach(function() {
        module('dplaceServices');
        module('dplace');
    });
    
    beforeEach(inject(function($rootScope, $controller, searchModelService, colorMapService, FindSocieties, $httpBackend) {
        appScope = $rootScope.$new();

        mockSearchModelService = searchModelService;
        mockAppCtrl = $controller('AppCtrl', {$scope: appScope, searchModelService: mockSearchModelService});
		
		regions = window.__fixtures__['regions'];
        mockColorMapService = colorMapService;
        mockFindSocieties = FindSocieties;
        searchScope = appScope.$new();
        mockSearchCtrl = $controller('SearchCtrl', {
            $scope: searchScope,
            colorMapService: mockColorMapService,
            searchModelService: mockSearchModelService,
            FindSocieties: mockFindSocieties
        });

        geographicScope = searchScope.$new();
        
        mockGeographicCtrl = $controller('GeographicCtrl', {
            $scope: geographicScope,
            searchModelService: mockSearchModelService
        });
        
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
        expect(geographicScope.geographic).toBeDefined();
    });
    
    it('should update badgeValue and call search', function() { 
        //test add region 
        geographicScope.geographic.selectedRegions.push(regions.easternEurope);
        geographicScope.$digest();
        expect(geographicScope.geographic.badgeValue).toEqual(1);
        geographicScope.geographic.selectedRegions.push(regions.Asia);
        geographicScope.$digest();
        expect(geographicScope.geographic.badgeValue).toEqual(2);
        
        /*geographicScope.doSearch();
        expect(searchScope.search).toHaveBeenCalled();
        searchScope.$digest();
                
        expected_searchQuery = {
            'p': [5, 4]
        };
        expect(mockSearchModelService.updateSearchQuery).toHaveBeenCalled();
        expect(mockSearchModelService.updateSearchQuery).toHaveBeenCalledWith(expected_searchQuery);
        expect(searchScope.searchSocieties).toHaveBeenCalled();*/
    });
    
    it('should call linkModel on reset', function() {
        //set some arbitrary values
        geographicScope.geographic.selectedRegions = [1, 2, 3, 4, 5];
        geographicScope.geographic.badgeValue = 5;
        
        searchScope.resetSearch();
        searchScope.$digest();
        
        //check that values have been reset
        expect(geographicScope.geographic.selectedRegions).toEqual([]);
        expect(geographicScope.geographic.badgeValue).toEqual(0);
        
    });
});

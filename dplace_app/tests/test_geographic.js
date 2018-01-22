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
        spyOn(appScope, 'setActive');
		
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
        spyOn(searchScope, 'search').and.callThrough();
        spyOn(mockSearchModelService, 'updateSearchQuery');
        spyOn(searchScope, 'searchSocieties');

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
        $httpBackend.whenPOST('/api/v1/find_societies')
            .respond(200);

    }));
    
    it('should update badgeValue and call search', function() { 
        //test add region 
        geographicScope.geographic.selectedRegions.push(regions.easternEurope);
        geographicScope.$digest();
        expect(geographicScope.geographic.badgeValue).toEqual(1);
        geographicScope.geographic.selectedRegions.push(regions.Asia);
        geographicScope.$digest();
        expect(geographicScope.geographic.badgeValue).toEqual(2);
        
        geographicScope.doSearch();
        expect(searchScope.search).toHaveBeenCalled();
        searchScope.$digest();
                
        expected_searchQuery = {
            'p': [5, 4]
        };
        expect(mockSearchModelService.updateSearchQuery).toHaveBeenCalled();
        expect(mockSearchModelService.updateSearchQuery).toHaveBeenCalledWith(expected_searchQuery);
        expect(searchScope.searchSocieties).toHaveBeenCalled();
    });
});

/*

Tests for models.js
- Test that everything is defined - done
- Test that prepopulated variables are populated - done
- Test that getters return correct parameters - done
- Test checking if selected - done
- Test reset function - done

*/

describe('Testing models.js', function() {
    var mockSearchModel, mockVarCat, mockLangFam, mockDatasets, mockLang, mockRegion, mockColor;
    
    beforeEach(function() {
        module('dplaceServices');
        module('dplace');
    });
    
    beforeEach(inject(function($httpBackend, VariableCategory, LanguageFamily, DatasetSources, GeographicRegion, Language, colorMapService) {
        mockVarCat = VariableCategory;
        mockLangFam = LanguageFamily;
        mockDatasets = DatasetSources;
        mockLang = Language;
        mockRegion = GeographicRegion;

        mockSearchModel = new SearchModel(mockVarCat, mockRegion, mockLangFam, mockDatasets, mockLang);

        //dummy data for some pre-populating model fields
        $httpBackend.whenGET('/api/v1/categories?page_size=1000')
            .respond(JSON.stringify({'count': 4, 'results': [{"id": 1}, {"id": 2}, {"id": 3}, {"id": 4}]}));
        $httpBackend.whenGET('/api/v1/get_dataset_sources')
            .respond([{"id": 100}, {"id": 101}, {"id": 102}, {"id": 103}]);
        $httpBackend.whenGET('/api/v1/geographic_regions?page_size=1000')
            .respond(JSON.stringify({'count': 1, 'results': [{'name': 'Africa'}, {'name':'Asia'}]}));
        $httpBackend.whenGET('/api/v1/categories?page_size=1000&type=environmental')
            .respond(JSON.stringify({'count': 5, 'results': [{'id':7}, {'id':8}, {'id':9}, {'id':10}]}));
        $httpBackend.whenGET('/api/v1/language_families?page_size=1000')
            .respond(JSON.stringify({'count': 2, 'results': [{'name':'Austronesian'}, {'name':'Indo-European'}]}));
        $httpBackend.whenGET('/api/v1/languages?page_size=1000')
            .respond(JSON.stringify({'count': 2, 'results': [{'name':'English'}, {'name':'French'}, {'name':'German'}]}));
            
        $httpBackend.flush();
        
    }));
    
   it('should expect everything to be defined', function() {
        expect(mockSearchModel.reset).toBeDefined();
        expect(mockSearchModel.results).toBeDefined();
        expect(mockSearchModel.params).toBeDefined();
        expect(mockSearchModel.params.culturalTraits).toBeDefined();
        expect(mockSearchModel.params.geographicRegions).toBeDefined();
        expect(mockSearchModel.params.environmentalData).toBeDefined();
        expect(mockSearchModel.params.languageClassifications).toBeDefined();
        expect(mockSearchModel.query).toBeDefined();
        expect(mockSearchModel.results).toBeDefined();
        expect(mockSearchModel.results).toEqual({'societies': [], 'languageTrees': []});
        
        //getters
        expect(mockSearchModel.getCulturalTraits).toBeDefined();
        expect(mockSearchModel.getGeographicRegions).toBeDefined();
        expect(mockSearchModel.getEnvironmentalData).toBeDefined();
        expect(mockSearchModel.getLanguageClassifications).toBeDefined();
        expect(mockSearchModel.getQuery).toBeDefined();
        expect(mockSearchModel.getResults).toBeDefined();
        expect(mockSearchModel.getLanguageTrees).toBeDefined();
        expect(mockSearchModel.getSocieties).toBeDefined();
        expect(mockSearchModel.checkSelected).toBeDefined();
    });
    
    it('should check that pre-populated fields are populated + starting values', function() {
        parameters = mockSearchModel.params;
        filters = [
            { operator: 'inrange', name: 'between' },
            { operator: 'lt', name: 'less than'},
            { operator: 'gt', name: 'greater than'},
            { operator: 'outrange', name: 'outside'},
            { operator: 'all', name: 'all values'},
        ];
        
        expect(parameters.culturalTraits.categories).toEqual([]);
        //expect(parameters.culturalTraits.categories.length).toEqual(4);
        //expect(parameters.culturalTraits.categories.map(function(m) { return m.id; })).toEqual([1, 2, 3, 4]);
        
        expect(parameters.culturalTraits.sources.length).toEqual(4);
        expect(parameters.culturalTraits.sources.map(function(m) { return m.id; })).toEqual([100, 101, 102, 103]);
        expect(parameters.culturalTraits.selectedVariables).toEqual([]);
        expect(parameters.culturalTraits.selectedCategory).toEqual(null);
        expect(parameters.culturalTraits.selectedVariable).toEqual(null);
        expect(parameters.culturalTraits.badgeValue).toEqual(0);
        expect(parameters.culturalTraits.checkSelected).toBeDefined();
        
        expect(parameters.geographicRegions.allRegions.length).toEqual(2);
        expect(parameters.geographicRegions.allRegions.map(function(m) { return m.name; })).toEqual(['Africa', 'Asia']);
        expect(parameters.geographicRegions.selectedRegions).toEqual([]);
        expect(parameters.geographicRegions.badgeValue).toEqual(0);
        expect(parameters.geographicRegions.checkSelected).toBeDefined();
        
        expect(parameters.environmentalData.categories.length).toEqual(4);
        expect(parameters.environmentalData.categories.map(function(m) { return m.id; })).toEqual([7, 8, 9, 10]);
        expect(parameters.environmentalData.filters).toEqual(filters);
        expect(parameters.environmentalData.selectedVariables).toEqual([]);
        expect(parameters.environmentalData.badgeValue).toEqual(0);
        expect(parameters.environmentalData.checkSelected).toBeDefined();

        expect(parameters.languageClassifications.allClasses.length).toEqual(3);
        expect(parameters.languageClassifications.allClasses.map(function(m) { return m.name; })).toEqual(['Select All Languages', 'Austronesian', 'Indo-European']);
        expect(parameters.languageClassifications.allLanguages.length).toEqual(3);
        expect(parameters.languageClassifications.allLanguages.map(function(m) { return m.name; })).toEqual(['English', 'French', 'German']);
        expect(parameters.languageClassifications.selected).toEqual({});
        expect(parameters.languageClassifications.badgeValue).toEqual(0);
        expect(parameters.languageClassifications.checkSelected).toBeDefined();
        
    });
    
    it('should test getters', function(){
        //set some arbitrary values
        mockSearchModel.params.culturalTraits.selectedVariables = [1, 2, 3];
        mockSearchModel.params.geographicRegions.selectedRegions = [56, 78];
        mockSearchModel.params.environmentalData.selectedVariables = [5, 4];
        mockSearchModel.params.languageClassifications.selected = {'Austronesian': [54, 67]};
        mockSearchModel.query = {'c': [1, 2, 3]};
        mockSearchModel.results = {'societies':[1, 2, 3, 4, 5], 'languageTrees': [4, 5, 6]};
        
        //should return the values stored in the model
        r = mockSearchModel.getCulturalTraits();
        expect(r).toEqual(mockSearchModel.params.culturalTraits);
        r = mockSearchModel.getGeographicRegions();
        expect(r).toEqual(mockSearchModel.params.geographicRegions);
        r = mockSearchModel.getEnvironmentalData();
        expect(r).toEqual(mockSearchModel.params.environmentalData);
        r = mockSearchModel.getLanguageClassifications();
        expect(r).toEqual(mockSearchModel.params.languageClassifications);
        r = mockSearchModel.getQuery();
        expect(r).toEqual(mockSearchModel.query);
        r = mockSearchModel.getResults();
        expect(r).toEqual(mockSearchModel.results);
        r = mockSearchModel.getLanguageTrees();
        expect(r).toEqual([4, 5, 6]);
        r = mockSearchModel.getSocieties();
        expect(r).toEqual([1, 2, 3, 4, 5]);
    });
    
    it('should test reset function', function() {
        //set some stuff
        mockSearchModel.params.culturalTraits.selectedVariables = [1, 2, 3];
        mockSearchModel.params.geographicRegions.selectedRegions = [56, 78];
        mockSearchModel.params.environmentalData.selectedVariables = [5, 4];
        mockSearchModel.params.languageClassifications.selected = {'Austronesian': [54, 67]};
        mockSearchModel.query = {'c': [1, 2, 3]};
        mockSearchModel.results = {'societies':[1, 2, 3, 4, 5], 'languageTrees': [4, 5, 6]};
        
        mockSearchModel.reset();
        //check that everything was reset
        expect(mockSearchModel.params.culturalTraits.selectedVariables.length).toEqual(0);
        expect(mockSearchModel.params.geographicRegions.selectedRegions.length).toEqual(0);
        expect(mockSearchModel.params.environmentalData.selectedVariables.length).toEqual(0);
        expect(mockSearchModel.params.languageClassifications.selected).toEqual({});
        expect(mockSearchModel.query).toEqual({});
        expect(mockSearchModel.results).toEqual({'societies': [], 'languageTrees': []});
        
    });
    
    it('should test checking if anything is selected', function() {
        //set a selected variable
        mockSearchModel.reset(); // delete everything we did in test getters
        expect(mockSearchModel.checkSelected()).toBeFalsy();
        
        /* Geographic Regions */
        mockSearchModel.params.geographicRegions.selectedRegions = [1, 2, 3];
        //test individual functions
        expect(mockSearchModel.params.geographicRegions.checkSelected()).toBeTruthy();
        expect(mockSearchModel.params.culturalTraits.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.environmentalData.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.languageClassifications.checkSelected()).toBeFalsy();
        //test the general function
        expect(mockSearchModel.checkSelected()).toBeTruthy();
        
        /* Language Classifications */
        mockSearchModel.reset();
        mockSearchModel.params.languageClassifications.selected = {'Austronesian': [1, 2], 'Indo-European': [5]};
        expect(mockSearchModel.params.geographicRegions.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.culturalTraits.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.environmentalData.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.languageClassifications.checkSelected()).toBeTruthy();
        expect(mockSearchModel.checkSelected()).toBeTruthy();
        
        //check if nothing selected
        mockSearchModel.reset();
        mockSearchModel.params.languageClassifications.selected = {'Austronesian': [], 'Indo-European': []};
        expect(mockSearchModel.params.geographicRegions.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.culturalTraits.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.environmentalData.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.languageClassifications.checkSelected()).toBeFalsy();
        expect(mockSearchModel.checkSelected()).toBeFalsy();
        
        /* Environmental Data */
        mockSearchModel.reset();
        mockSearchModel.params.environmentalData.selectedVariables = [{"selectedVariable": 1}]
        expect(mockSearchModel.params.geographicRegions.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.culturalTraits.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.environmentalData.checkSelected()).toBeTruthy();
        expect(mockSearchModel.params.languageClassifications.checkSelected()).toBeFalsy();
        expect(mockSearchModel.checkSelected()).toBeTruthy();
        
        mockSearchModel.reset();
        mockSearchModel.params.environmentalData.selectedVariables = [{"id": 2, "categories": [1, 2, 3]}] //no selectedVariable
        expect(mockSearchModel.params.geographicRegions.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.culturalTraits.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.environmentalData.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.languageClassifications.checkSelected()).toBeFalsy();
        expect(mockSearchModel.checkSelected()).toBeFalsy();
        
        /* Cultural Data */
        mockSearchModel.reset();
        mockSearchModel.params.culturalTraits.selectedVariables = [
            {
                "id": 6,
                "data_type": "categorical",
                "codes": [{"id": 1, "isSelected": true}, {"id": 2, "isSelected": true}]
            }
        ];
        expect(mockSearchModel.params.geographicRegions.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.culturalTraits.checkSelected()).toBeTruthy();
        expect(mockSearchModel.params.environmentalData.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.languageClassifications.checkSelected()).toBeFalsy();
        expect(mockSearchModel.checkSelected()).toBeTruthy();
        
        //check continuous variable
        mockSearchModel.reset();
        mockSearchModel.params.culturalTraits.selectedVariables = [
            {
                "id": 6,
                "data_type": "continuous",
            }
        ];
        expect(mockSearchModel.params.geographicRegions.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.culturalTraits.checkSelected()).toBeTruthy();
        expect(mockSearchModel.params.environmentalData.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.languageClassifications.checkSelected()).toBeFalsy();
        expect(mockSearchModel.checkSelected()).toBeTruthy();
        
        //check no codes selected
        mockSearchModel.reset();
        mockSearchModel.params.culturalTraits.selectedVariables = [
            {
                "id": 6,
                "data_type": "categorical",
                "codes": [{"id": 1}, {"id": 2, "isSelected": false}]
            }
        ];
        expect(mockSearchModel.params.geographicRegions.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.culturalTraits.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.environmentalData.checkSelected()).toBeFalsy();
        expect(mockSearchModel.params.languageClassifications.checkSelected()).toBeFalsy();
        expect(mockSearchModel.checkSelected()).toBeFalsy();
    });
    
    

});

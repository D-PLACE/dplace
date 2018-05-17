//tests for language.js, containing the following functions to test:
// selectionChanged
// selectAllChanged
// addToSelection
// classificationSelectionChanged
// doSearch

describe('Testing language controller', function() {
    var $httpBackend, appScope, mockAppCtrl, searchScope, langScope, mockSearchCtrl, mockLangCtrl, mockSearchModelService, mockFindSocieties, mockColorMapService, languages;
    var language1, language2, language3; 
    beforeEach(function() {
        module('dplaceServices');
        module('dplace');
    });
    
    beforeEach(inject(function($injector, $rootScope, $controller, searchModelService, colorMapService, FindSocieties) {
        appScope = $rootScope.$new();
        $httpBackend = $injector.get('$httpBackend');
        mockSearchModelService = searchModelService;
        mockAppCtrl = $controller('AppCtrl', {$scope: appScope, searchModelService: mockSearchModelService});
        spyOn(appScope, 'setActive');
		
		//Load Language JSON data
		languages = window.__fixtures__['languages'];
        
		mockColorMapService = colorMapService;
        
        searchScope = appScope.$new();
        mockSearchCtrl = $controller('SearchCtrl', {
            $scope: searchScope,
            colorMapService: mockColorMapService,
            searchModelService: mockSearchModelService,
            FindSocieties: mockFindSocieties
        });

        langScope = searchScope.$new();
		
        mockLangCtrl = $controller('LanguageCtrl', {
            $scope: langScope,
            searchModelService: mockSearchModelService
        });
        
        //SPIES
        spyOn(searchScope, 'removeFromSearch').and.callThrough();
        spyOn(searchScope, 'resetSearch').and.callThrough();
        spyOn(langScope, 'classificationSelectionChanged').and.callThrough();
        spyOn(langScope, 'selectAllChanged').and.callThrough();
                            
        language1 = languages.language1;
        language2 = languages.language2;
        language3 = languages.language3;
        mockSearchModelService.getModel().getLanguageClassifications().allClasses = [{'name': 'Select All Languages', 'language_count': 5}, language1.family, language2.family];
        mockSearchModelService.getModel().getLanguageClassifications.allLanguages = [language1, language2, language3];
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
        expect(langScope.languageClassifications).toBeDefined();
        expect(langScope.families).toBeDefined();
        expect(langScope.selectionChanged).toBeDefined();
        expect(langScope.selectAllChanged).toBeDefined();
        expect(langScope.addToSelection).toBeDefined();
        expect(langScope.classificationSelectionChanged).toBeDefined();
    });
    
    it('should update selection when the user chooses a language family', function() {
		langScope.languageClassifications.allLanguages = [language1, language2, language3];
        //expected results
        expected = [[1, [language1], 'Family 1', 2], [2, [language2, language3], 'Austronesian', 3]]
        
        //do this twice - once for Family 1 (single language) and once for Family 2 (multi-language family)
        for (var l = 0; l < 2; l++) {
            langScope.languageClassifications.badgeValue = 0;
            langScope.families[0].selectedFamily = langScope.languageClassifications.allLanguages[l].family;
            langScope.selectionChanged(langScope.families[0]);
            langScope.$digest();
            expect(langScope.selectAllChanged).toHaveBeenCalled();
            expect(langScope.families[0].languages.length).toBe(expected[l][0]);
            expect(langScope.families[0].languages.allSelected).toBeTruthy();
            expect(langScope.families[0].selectedFamily.alreadySelected).toBeTruthy();
            langScope.families[0].languages.forEach(function(lang) { expect(lang.isSelected).toBeTruthy(); });
            expect(langScope.languageClassifications.selected[expected[l][2]]).toEqual(expected[l][1]);
            expect(langScope.languageClassifications.badgeValue).toEqual(expected[l][3]);
            langScope.languageClassifications.selected[expected[l][2]].splice(0, 1); //remove first language from selection
            langScope.selectionChanged(langScope.families[0]);
            langScope.$digest();
            //shouldn't call this again because we've already selected the family before
            expect(langScope.selectAllChanged.calls.count()).toBe(expected[l][0]); 
            expect(langScope.families[0].languages[0].isSelected).toBeFalsy();
            if (l == 1)
                expect(langScope.families[0].languages[1].isSelected).toBeTruthy();
            expect(langScope.families[0].selectedFamily.allSelected).toBeFalsy();
        }
    });
    
    //test 'Select All Languages' function
    it('should select all languages', function() {
        langScope.languageClassifications.allLanguages = [language1, language2, language3];
        langScope.families[0].selectedFamily = {'name': 'Select All Languages'};
        langScope.selectionChanged(langScope.families[0]);
        langScope.$digest();
        expect(langScope.selectAllChanged).toHaveBeenCalled();
        expect(langScope.families[0].languages.length).toBe(3);
        expect(langScope.families[0].languages.allSelected).toBeTruthy();
        langScope.families[0].languages.forEach(function(lang) { expect(lang.isSelected).toBeTruthy(); });
        expect(langScope.languageClassifications.selected['Family 1']).toBeDefined();
        expect(langScope.languageClassifications.selected['Austronesian']).toBeDefined();
        expect(langScope.languageClassifications.selected['Family 1']).toEqual([language1]);
        expect(langScope.languageClassifications.selected['Austronesian']).toEqual([language2, language3]);
        expect(langScope.languageClassifications.badgeValue).toEqual(5);
        //select all families as already selected
        langScope.families[0].forEach(function(f) { expect(f.alreadySelected).toBeTruthy(); });
        
        langScope.languageClassifications.selected['Family 1'] = [];
        langScope.languageClassifications.badgeValue = 4;
        langScope.selectionChanged(langScope.families[0]);
        langScope.$digest();
        expect(langScope.selectAllChanged.calls.count()).toBe(1); //shouldn't call again
        expect(langScope.families[0].languages[0].isSelected).toBeFalsy();
        expect(langScope.families[0].languages[1].isSelected).toBeTruthy();
        expect(langScope.families[0].languages[2].isSelected).toBeTruthy();
        expect(langScope.families[0].languages.allSelected).toBeFalsy();
    });
    
    it('should add to selection', function() {
        language1.isSelected = true;
        langScope.addToSelection(language1);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Family 1']).toBeDefined();
        expect(langScope.languageClassifications.selected['Family 1'].length).toEqual(1);
        expect(langScope.languageClassifications.selected['Family 1'][0]).toBe(language1);
        expect(langScope.languageClassifications.badgeValue).toEqual(2);
        
        language2.isSelected = true;
        language3.isSelected = true;
        langScope.addToSelection(language2);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Austronesian']).toBeDefined();
        expect(langScope.languageClassifications.selected['Austronesian'].length).toEqual(1);
        expect(langScope.languageClassifications.selected['Austronesian'][0]).toBe(language2);
        expect(langScope.languageClassifications.badgeValue).toEqual(3);
        langScope.addToSelection(language3);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Austronesian'].length).toEqual(2);
        expect(langScope.languageClassifications.selected['Austronesian'][1]).toBe(language3);
        expect(langScope.languageClassifications.badgeValue).toEqual(5);
        
    });
    
    it('should add from classificationSelectionChanged', function() {
        language1.isSelected = true;
        langScope.families[0].selectedFamily = language1.family;
        langScope.families[0].languages = [language1];
        langScope.classificationSelectionChanged(language1, langScope.families[0]);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Family 1']).toBeDefined();
        expect(langScope.languageClassifications.selected['Family 1'].length).toEqual(1);
        expect(langScope.languageClassifications.selected['Family 1'][0]).toBe(language1);
        expect(langScope.languageClassifications.badgeValue).toEqual(2);
        expect(langScope.families[0].languages.allSelected).toBeTruthy();
        
        language2.isSelected = true;
        language3.isSelected = false;
        langScope.families[0].selectedFamily = language2.family;
        langScope.families[0].languages = [language1, language2];
        langScope.classificationSelectionChanged(language2, langScope.families[0]);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Austronesian']).toBeDefined();
        expect(langScope.languageClassifications.selected['Austronesian'].length).toEqual(1);
        expect(langScope.languageClassifications.selected['Austronesian'][0]).toBe(language2);
        expect(langScope.languageClassifications.badgeValue).toEqual(3);
        expect(langScope.families[0].languages.allSelected).toBeFalsy();
        
        //test adding already-added language
        langScope.classificationSelectionChanged(language2, langScope.families[0]);
        langScope.$digest();
        expect(langScope.languageClassifications.selected['Austronesian']).toBeDefined();
        expect(langScope.languageClassifications.selected['Austronesian'].length).toEqual(1);
        expect(langScope.languageClassifications.selected['Austronesian'][0]).toBe(language2);
        expect(langScope.languageClassifications.badgeValue).toEqual(3);
        expect(langScope.families[0].languages.allSelected).toBeFalsy();
    });
    
    it('should remove from classificationSelectionChanged', function() {
        //remove one language, one family
        langScope.families[0].selectedFamily = language1.family;
        langScope.families[0].languages = [language1];
        langScope.languageClassifications.selected['Family 1'] = [language1];
        langScope.languageClassifications.badgeValue = 9;
        
        language1.isSelected = false;
        langScope.classificationSelectionChanged(language1, langScope.families[0]);
        langScope.$digest();
        expect(searchScope.removeFromSearch).toHaveBeenCalled();
        expect(langScope.languageClassifications.selected['Family 1']).toBeDefined();
        expect(langScope.languageClassifications.selected['Family 1'].length).toEqual(0);
        expect(langScope.languageClassifications.badgeValue).toEqual(7);
        expect(langScope.families[0].languages.allSelected).toBeFalsy();
        
        //remove one language, more than one in the family
        langScope.families[0].selectedFamily = language2.family;
        langScope.families[0].languages = [language2, language3];
        langScope.languageClassifications.selected['Austronesian'] = [language2, language3];
        langScope.languageClassifications.badgeValue = 11;
        
        language2.isSelected = false;
        langScope.classificationSelectionChanged(language2, langScope.families[0]);
        langScope.$digest();
        expect(searchScope.removeFromSearch).toHaveBeenCalled();
        expect(langScope.languageClassifications.selected['Austronesian'].length).toEqual(1);
        expect(langScope.languageClassifications.badgeValue).toEqual(10);
        expect(langScope.families[0].languages.allSelected).toBeFalsy();
        
        //empty selection - shouldn't do anything
        langScope.languageClassifications.selected = {};
        langScope.classificationSelectionChanged(language2, langScope.families[0]);
        langScope.$digest();
        expect(searchScope.removeFromSearch.calls.count()).toEqual(2);
    });

    it('should select/deselect all languages', function() {
       langScope.families[0].selectedFamily = language2.family; 
       language2.isSelected = false;
       language3.isSelected = false;
       langScope.families[0].languages = [language2, language3];
       langScope.families[0].languages.allSelected = true;
       langScope.selectAllChanged(langScope.families[0]);
       langScope.$digest();
       expect(language2.isSelected).toBeTruthy();
       expect(language3.isSelected).toBeTruthy();
       expect(langScope.languageClassifications.selected['Austronesian']).toBeDefined();
       expect(langScope.languageClassifications.selected['Austronesian']).toEqual([language2, language3]);
       langScope.families[0].languages.allSelected = false;
       langScope.selectAllChanged(langScope.families[0]);
       langScope.$digest();
       expect(langScope.languageClassifications.selected['Austronesian'].length).toBe(0);
    });
    
    it('should run linkModel after reset', function() {
        //set arbitrary values
        mockSearchModelService.getModel().getLanguageClassifications().selected = {
            "Family 1": [1, 2, 3, 4, 5],
            "Family 2": [6, 7, 8, 9, 10]
        };
        mockSearchModelService.getModel().getLanguageClassifications().badgeValue = 10;
        searchScope.resetSearch();
        searchScope.$digest();
        
        expect(mockSearchModelService.getModel().getLanguageClassifications().selected).toEqual({});
        expect(mockSearchModelService.getModel().getLanguageClassifications().badgeValue).toEqual(0);
        expect(langScope.languageClassifications).toEqual(mockSearchModelService.getModel().getLanguageClassifications());
    });
    
    /*it('should do search', function() {
        language1.isSelected = true;
        language2.isSelected = true;
        language3.isSelected = true;
        langScope.languageClassifications.selected = {
            'Family 1': [language1],
            'Austronesian': [language2, language3]
        }
        langScope.$digest();
        langScope.doSearch();
        langScope.$digest();
        expect(searchScope.search).toHaveBeenCalled();
        searchScope.$digest();
        expected_searchquery = {
            'l': [language1.id, language2.id, language3.id]
        };
        expect(mockSearchModelService.updateSearchQuery).toHaveBeenCalledWith(expected_searchquery);
        expect(searchScope.searchSocieties).toHaveBeenCalled();
    });*/
});

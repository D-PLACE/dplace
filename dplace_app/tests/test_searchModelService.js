/* Tests SearchmodelService, which has functions:
    updateSearchQuery
    sortClassifications
    calculateRange
    assignColors
    searchCompletedCallback
    
*/

describe('Search Model Service Testing', function() {
    var mockSearchModelService, mockQuery, mockResults, mockVariableCategory, mockGeographicRegion, mockLanguageFamily, mockDatasetSources, mockLanguage, mockColorMapService, society1, society2, society3;
    
	//for loading JSON data
	var regions, languages, environmentals, culturals, societies;
	
	//mock data for tests stored in variables below
    var geographic_region, environmental_variable, environmental_value, categorical_env_variable, variable_description, variable_description_2, coded_value, coded_value_na, continuous_variable, coded_float, coded_float_2, language1, language2, language3;
        
    beforeEach(function() {
        module('dplaceServices');
        module('dplace');
    });
    
    beforeEach(inject(function(searchModelService) {
        mockSearchModelService = searchModelService;
        
        //initialize mockQuery
        mockQuery = {
            'c': [[1, 'gt', [0, 10]], [2, 'categorical', [2, 3, 4, 5]]],
            'e': [[6, 'lt', [10, 20]]],
            'g': [1, 2, 3, 4, 5],
            'l': []
        };
        spyOn(mockSearchModelService, 'assignColors').and.callThrough();
        mockResults = {
            'societies': [],
            'environmental_variables': [],
            'geographic_regions': [],
            'languages': [],
            'variable_descriptions': []
        }; //used to store the mock results for the test
        
        //get data for testing
	   
        society1 = window.__fixtures__['societies'].society1;
        society2 = window.__fixtures__['societies'].society2;
        society3 = window.__fixtures__['societies'].society3;
		
		regions = window.__fixtures__['regions'];
		environmentals = window.__fixtures__['environmentals'];
		languages = window.__fixtures__['languages'];
		culturals = window.__fixtures__['culturals'];

		geographic_region = regions.Africa;
        
        language1 = languages.language1;
        language2 = languages.language2;
        language3 = languages.language3;
        
		environmental_variable = environmentals.variables.continuousEnvVar;
        environmental_value = environmentals.coded_values.continuousEnvVar;
        
        categorical_env_variable = environmentals.variables.categoricalEnvVar;
        variable_description = culturals.variables.categoricalCulturalVar;
        variable_description_2 = culturals.variables.categoricalCulturalVar2;
        coded_value = culturals.coded_values.categoricalCulturalVar;
        coded_value_na = culturals.coded_values.categoricalCulturalVarNA;
        
        continuous_variable = culturals.variables.continuousCulturalVar;
        coded_float = culturals.coded_values.continuousCulturalVar1;
        coded_float_2 = culturals.coded_values.continuousCulturalVar2;

    }));
	
	//reset all models etc from previous test(s)
	beforeEach(function() {

		//clear previous stuff
		society1.environmental_values = [];
		society1.geographic_regions = [];
		society1.variable_coded_values = [];
		society2.environmental_values = [];
		society2.geographic_regions = [];
		society2.variable_coded_values = [];
		society3.environmental_values = [];
		society3.geographic_regions = [];
		society3.variable_coded_values = [];
		delete society1.society.style;
		delete society2.society.style;
		delete society3.society.style;
		society1.society.language = language1;
		society1.society.region = geographic_region;
		society2.society.language = language2
		delete society3.society.language;
	});
    
    it('checking model + functions exist', function() {
        expect(mockSearchModelService.model).toBeDefined();
        expect(mockSearchModelService.getModel).toBeDefined();
        expect(mockSearchModelService.updateSearchQuery).toBeDefined();
        expect(mockSearchModelService.assignColors).toBeDefined();
        expect(mockSearchModelService.searchCompletedCallback).toBeDefined();
    });
    
    it('should update search query', function() {
        mockSearchModelService.updateSearchQuery(mockQuery);
        expect(mockSearchModelService.model.query).toBeDefined();
        expect(mockSearchModelService.model.query).toEqual(mockQuery);
    });
    
    it('should execute searchCompletedCallback', function() {
        mockSearchModelService.model.results = mockResults;
        mockSearchModelService.searchCompletedCallback();
        expect(mockSearchModelService.assignColors).toHaveBeenCalledWith(mockResults);
        expect(mockSearchModelService.model.results.searched).toBeTruthy();
    });
    
	
	//Tests for function assignColors
	//assignColors sets marker colors for each society, in the following priority:
	//cultural variables
	//environmental variables
	//language classifications
	//geographic regions
	//the functions below are in order to test these priorities.

    it('should assign colors - geographic region', function() {
        mockResults.geographic_regions = [geographic_region, regions.easternEurope, regions.Asia, regions.Asia]
        mockResults.societies.push(society1);
        mockSearchModelService.assignColors(mockResults);
        expect(mockResults.geographic_regions.codes).toBeDefined();
        expect(mockResults.geographic_regions.codes[geographic_region.tdwg_code]).toBe('rgb(255,255,0)');
        expect(mockResults.societies[0].society.style).toBeDefined();
        expect(mockResults.societies[0].society.style['background-color']).toEqual(mockResults.geographic_regions.codes[geographic_region.tdwg_code]);
    });
        
    it('should assign colors - languages', function() {
		
        mockQuery = {'l': [1, 2, 3, 4, 5]};
        mockSearchModelService.updateSearchQuery(mockQuery);
        mockResults.societies = [society1, society2, society3];
        mockResults.languages = mockResults.languages.concat([language1, language2, language3]);
        
        mockSearchModelService.assignColors(mockResults);
        expect(mockResults.classifications).toBeDefined();
        //in alphabetical order
        expect(mockResults.classifications[0]).toEqual(language2.family);
        expect(mockResults.classifications[1]).toEqual(language1.family);
        //check things are defined
        expect(mockResults.classifications.codes).toBeDefined();
        expect(mockResults.societies[0].society.style).toBeDefined();
        expect(mockResults.societies[1].society.style).toBeDefined();
        expect(mockResults.societies[2].society.style).not.toBeDefined(); //no language associated w this society
        
        expect(mockResults.societies[0].society.style['background-color']).toEqual(mockResults.classifications.codes[language1.family.id]);
        expect(mockResults.societies[1].society.style['background-color']).toEqual(mockResults.classifications.codes[language2.family.id]);

    });
	
    it('should assign colors - environmental variable', function() {
        mockResults.environmental_variables = [environmental_variable, categorical_env_variable];
        society1.environmental_values.push(environmental_value);
        society2.environmental_values.push({'coded_value_float': -17, 'variable': 317});
        society2.environmental_values.push({'coded_value': '1', 'variable': 318, 'code_description': categorical_env_variable.codes[1]})
        society3.environmental_values.push({'coded_value_float': 29, 'variable': 317});
        mockResults.societies = [society1, society2, society3]
        mockSearchModelService.assignColors(mockResults);
        //should calculate range
        expect(mockResults.environmental_variables[0].min).toBeDefined();
        expect(mockResults.environmental_variables[0].min).toEqual(-17);
        expect(mockResults.environmental_variables[0].max).toBeDefined();
        expect(mockResults.environmental_variables[0].max).toEqual(29);
        
        //check colors are correct, and that container.society.style background-color is set
        expect(mockResults.societies[0].environmental_values[0].color).toBe('rgb(255,238,0)');
        expect(mockResults.environmental_variables[1].codes.codes).toBeDefined();
        expect(mockResults.societies[0].society.style).toBeDefined();
        expect(mockResults.societies[0].society.style['background-color']).toBe('rgb(255,238,0)');
        mockResults.societies[2].environmental_values = [{'coded_value': 2, 'variable': 318}];
        mockSearchModelService.assignColors(mockResults);
        expect(mockResults.societies[2].society.style).toBeDefined();
        expect(mockResults.societies[2].society.style['background-color']).toBe('rgb(0,255,102)');

    });

    it('should assign colors - cultural variable', function() {
        mockResults.variable_descriptions = [variable_description, continuous_variable, variable_description_2];
        society1.variable_coded_values = [coded_value, coded_float_2];
        society2.variable_coded_values = [coded_value_na, coded_float];
        society3.variable_coded_values.push({'coded_value_float': 1000, 'coded_value': 1000, 'variable': 66});
        mockResults.societies = [society1, society2, society3];
        mockSearchModelService.assignColors(mockResults);
        
        //check that stuff is defined
        expect(mockResults.variable_descriptions[0].codes.codes).toBeDefined();
        expect(mockResults.variable_descriptions[1].codes.codes).not.toBeDefined();
        expect(mockResults.variable_descriptions[2].codes.codes).toBeDefined()
        expect(mockResults.variable_descriptions[1].min).toBeDefined();
        expect(mockResults.variable_descriptions[1].max).toBeDefined();
        expect(mockResults.societies[0].variable_coded_values[1].color).toBeDefined();

        //check values for stuff
        expect(mockResults.variable_descriptions[1].min).toEqual(0);
        expect(mockResults.variable_descriptions[1].max).toEqual(1000);
        
        expect(mockResults.societies[0].society.style).toBeDefined();
        expect(mockResults.societies[1].society.style).toBeDefined();
        
        expect(mockResults.societies[0].society.style['background-color']).toBe('rgb(228,26,28)');
        expect(mockResults.societies[1].society.style['background-color']).toBe('rgb(255,255,255)');
        expect(mockResults.societies[2].society.style['background-color']).toEqual(mockResults.societies[2].variable_coded_values[0].color);

    });
});

/* Tests ColorMapService, which has functions:
    tempColor(index, min, max, name)
    mapColor(index, count)
    mapColorMonochrome(min, max, value, color)
    generateColorMap(results)
    
*/

describe('Color Map Service Testing', function() {
    var mockColorService, mockResults, society, society2, society3;
    
	//to load JSON data
	var regions, environmentals, culturals, languages;
	
    beforeEach(function() {
        module('dplaceServices');
    });
    
    beforeEach(inject(function(colorMapService) {
        mockColorService = colorMapService;
        mockResults = {
            'societies': [],
            'environmental_variables': [],
            'geographic_regions': [],
            'languages': [],
            'variable_descriptions': []
        }; //used to store the mock results for the test
        
        society = window.__fixtures__['societies'].society1;
        society2 = window.__fixtures__['societies'].society2;
        society3 = window.__fixtures__['societies'].society3;
		
		regions = window.__fixtures__['regions'];
		environmentals = window.__fixtures__['environmentals'];
		languages = window.__fixtures__['languages'];
		culturals = window.__fixtures__['culturals'];

    }));
    
    //reset all models etc from previous test(s)
	beforeEach(function() {
		//clear previous stuff
		society.environmental_values = [];
		society.geographic_regions = [];
		society.variable_coded_values = [];
		society2.environmental_values = [];
		society2.geographic_regions = [];
		society2.variable_coded_values = [];
		society3.environmental_values = [];
		society3.geographic_regions = [];
		society3.variable_coded_values = [];
		delete society.society.style;
		delete society2.society.style;
		delete society3.society.style;
		society.society.language = languages.language1;
		society.society.region = regions.Africa;
		society2.society.language = languages.language2;
		delete society3.society.language;
	});
    
    it('should check that everything is defined', function() {
        expect(mockColorService.tempColor).toBeDefined();
        expect(mockColorService.mapColor).toBeDefined();
        expect(mockColorService.mapColorMonochrome).toBeDefined();
        expect(mockColorService.generateRandomHue).toBeDefined();
        expect(mockColorService.generateColorMap).toBeDefined();
    });
    
    it('geographic region color map', function() {
        var geographic_region = regions.Africa;
        society.society.region = geographic_region;
        mockResults.geographic_regions.push(geographic_region);
        mockResults.societies.push(society);
        var results = mockColorService.generateColorMap(mockResults);
        expect(results.geographic_regions.codes).toBeDefined();
        expect(results.geographic_regions.codes[geographic_region.tdwg_code]).toBe('rgb(255,0,0)');
    });
    
    it('environmental color map', function() {
        var environmental_variable = environmentals.variables.continuousEnvVar;
        var environmental_value = environmentals.coded_values.continuousEnvVar;
        
        var categorical_env_variable = environmentals.variables.categoricalEnvVar;

        mockResults.environmental_variables.push(environmental_variable);
        mockResults.environmental_variables.push(categorical_env_variable);
        society.environmental_values.push(environmental_value);
        mockResults.societies.push(society);
        var results = mockColorService.generateColorMap(mockResults);
        expect(results.societies[0].environmental_values[0].color).toBe('rgb(255,238,0)');
        expect(results.environmental_variables[1].codes.codes).toBeDefined();
        expect(results.environmental_variables[1].codes.codes['NA']).toBe('rgb(255,255,255)');
        expect(results.environmental_variables[1].codes.codes[1]).toBe('rgb(0,204,255)');
        expect(results.environmental_variables[1].codes.codes[2]).toBe('rgb(0,255,102)');
        expect(results.environmental_variables[1].codes.codes[3]).toBe('rgb(102,255,0)');
        expect(results.environmental_variables[1].codes.codes[4]).toBe('rgb(255,204,0)');
    });
    
    it('cultural variable map', function() {
        var variable_description = culturals.variables.categoricalCulturalVar;
        var coded_value = culturals.coded_values.categoricalCulturalVar;
        var coded_value_na = culturals.coded_values.categoricalCulturalVarNA;
        var continuous_variable = culturals.variables.continuousCulturalVar;
        
        var coded_float = culturals.coded_values.continuousCulturalVar1;
        
        var coded_float_2 = {
            'coded_value_float': 11,
            'coded_value': 11,
            'variable': 66
        };
        
        mockResults.variable_descriptions.push(variable_description);
        mockResults.variable_descriptions.push(continuous_variable);
        society.variable_coded_values.push(coded_value);
        society2.variable_coded_values.push(coded_value_na);
        society2.variable_coded_values.push(coded_float);
        society.variable_coded_values.push(coded_float_2);
        mockResults.societies.push(society);
        mockResults.societies.push(society2);
        var results = mockColorService.generateColorMap(mockResults);
        expect(results.variable_descriptions[0].codes.codes).toBeDefined();
        expect(results.variable_descriptions[1].codes.codes).not.toBeDefined();
        expect(results.variable_descriptions[0].codes.codes[1]).toEqual('rgb(228,26,28)');
        expect(results.variable_descriptions[0].codes.codes['NA']).toEqual('rgb(255,255,255)'); 
        expect(results.variable_descriptions[0].codes.codes[2]).toEqual('rgb(69,117,180)');
        expect(results.variable_descriptions[0].codes.codes[3]).toEqual('rgb(77,146,33)');
        expect(results.variable_descriptions[0].codes.codes[4]).toEqual('rgb(152,78,163)');
    });
    
    
    it('should use monochromatic scale for ordinal variables', function() {
        var variable_description = culturals.variables.ordinalCulturalVar;
        var coded_value = culturals.coded_values.ordinalCulturalVar;
        
        mockResults.variable_descriptions.push(variable_description);
        society.variable_coded_values.push(coded_value);
        mockResults.societies.push(society);
        var results = mockColorService.generateColorMap(mockResults);
        //check to make sure it isn't assigning the color from colorMap
        expect(results.variable_descriptions[0].codes.codes).toBeDefined();
        expect(results.variable_descriptions[0].codes.codes[1]).not.toEqual('rgb(228,26,28)');
        expect(results.variable_descriptions[0].codes.codes[1]).toEqual('rgb(97,222,97)');
    
    });
    
    it('language family map', function() {
        society3.society.language = languages.language3;
        mockResults.societies.concat([society, society2, society3]);
        mockResults.languages = mockResults.languages.concat([languages.language1, languages.language2, languages.language3]);
        mockResults.classifications = [languages.Family1, languages.Austronesian];
        
        var results = mockColorService.generateColorMap(mockResults);
        expect(results.classifications.codes).toBeDefined();
        expect(results.classifications.codes[society.society.language.family.id]).toBe("rgb(255,0,0)");
        expect(results.classifications.codes[society2.society.language.family.id]).toBe('rgb(0,255,0)');
        expect(results.classifications.codes[society2.society.language.family.id]).toEqual(results.classifications.codes[society3.society.language.family.id]);
    });
    
    it('geographic regions and languages color map', function() {
        //when searching by geographic region and language family, should get colors for both but display only language family in directives.js
        var geographic_region = regions.Africa;
        society.geographic_regions.push(geographic_region);
        mockResults.geographic_regions.push(geographic_region);
        mockResults.languages.push(languages.language1);
        mockResults.classifications = [languages.Family1, languages.Austronesian];
        mockResults.societies.push(society);
        var results = mockColorService.generateColorMap(mockResults);
        expect(results.classifications.codes).toBeDefined();
        expect(results.geographic_regions.codes).toBeDefined();
        expect(results.classifications.codes[society.society.language.family.id]).toBe('rgb(255,0,0)');
        expect(results.geographic_regions.codes[geographic_region.tdwg_code]).toBe('rgb(255,0,0)');
    });

});

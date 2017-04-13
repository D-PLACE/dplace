/*
 * This service wraps a singleton object that keeps track of user's
 * search UI state across controllers
 * @constructor
 */
function SearchModelService(VariableCategory, GeographicRegion, LanguageFamily, DatasetSources, Language, FindSocieties, colorMapService) {
    this.model = new SearchModel(VariableCategory, GeographicRegion, LanguageFamily, DatasetSources, Language);
    this.getModel = function() {
        return this.model;
    }
    
    this.updateSearchQuery = function(searchQuery) {
        this.getModel().query = {};
        for (var propertyName in searchQuery) {
            this.getModel().query[propertyName] = searchQuery[propertyName];
        }
    }
    
    var sortClassifications = function(results) { // do this for language search!
        results.classifications = [];
        results.societies.forEach(function(res) {
            if (res.society.language) {
                family = res.society.language.family;
                if (results.classifications.map(function(c) { return c.id; }).indexOf(family.id) == -1) results.classifications.push(family);
            }
        });
        results.classifications.sort(function(a,b) {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            else return 0;
        });
    }
    
    var calculateRange = function(results) {
        if (results.societies.length == 0) return results;
        societies = results.societies;         
        for (var i = 0; i < results.environmental_variables.length; i++) {
            results.environmental_variables[i].CID = "E"+(i+1);
            if (results.environmental_variables[i].data_type != 'Continuous') continue;
            extractedValues = societies.map(function(society) { 
                for (var j = 0; j < society.environmental_values.length; j++) {
                    if (society.environmental_values[j].variable == results.environmental_variables[i].id) {
                        if (society.environmental_values[j].coded_value_float) return society.environmental_values[j].coded_value_float;
                    }
                }
            });
            
            results.environmental_variables[i]['min'] = Math.min.apply(null, extractedValues);
            results.environmental_variables[i]['max'] = Math.max.apply(null, extractedValues);
        }
        
        for (var i = 0; i < results.variable_descriptions.length; i++) {
            results.variable_descriptions[i].CID = "C"+(i+1);
            if (results.variable_descriptions[i].variable.data_type != 'Continuous') continue;
            extractedValues = societies.map(function(society) { 
                for (var j = 0; j < society.variable_coded_values.length; j++) {
                    if (society.variable_coded_values[j].variable == results.variable_descriptions[i].variable.id) {
                        if (society.variable_coded_values[j].coded_value_float) return society.variable_coded_values[j].coded_value_float;
                    }
                }
            });
            
            results.variable_descriptions[i]['min'] = Math.min.apply(null, extractedValues);
            results.variable_descriptions[i]['max'] = Math.max.apply(null, extractedValues);
        }
        return results;
    }

    this.assignColors = function(results) {
        query = this.getModel().query;
        if (query.l && !query.c && !query.e) sortClassifications(results);
        if (results.geographic_regions.length > 0) {
            results.geographic_regions.sort(function(a,b) {
                if (a.region_nam.toLowerCase() < b.region_nam.toLowerCase()) return -1;
                else if (a.region_nam.toLowerCase() > b.region_nam.toLowerCase()) return 1;
                else return 0;
            })
        }   
        results = calculateRange(results);
        var colorMap = colorMapService.generateColorMap(results);
        results.societies.forEach(function(container) {
            container.society.style = {'background-color': colorMap[container.society.id] };
        });
    }
    
    this.searchCompletedCallback = function() {
        this.assignColors(this.getModel().results);
        this.getModel().results.searched = true;
    };
}
        
        
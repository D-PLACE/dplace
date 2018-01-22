angular.module('dplaceFilters', [])
    .filter('transformG', function() {
        return function(index) {
            if (index == 0) return 'translate(0,10)'
            else {
                j = (index * 25) + 10;
                return 'translate(0,'+j+')';
            }
        }
    })    
    .filter('isEmpty', function() {
        return function(object) {
            for (var i = 0; i < object.length; i++) { 
                if (object[i].selectedVariable) return true;
                else if (object[i].isSelected) return true;
            }
            for (var key in object) {
                if (object[key].length > 0) return true;
            }
            return false;
        }
    })
    
    .filter('formatVariables', function() {
        return function(selected, selectedVariable) {
            return selected.filter(function(code) { return code.variable == selectedVariable ;});
        };
    })
    .filter('numValues', function() {
        return function(values, variable_id) {
            return values.filter(function(code_value) {
                if (code_value.code_description && (variable_id == code_value.code_description.variable)) return code_value;
                else if (variable_id == code_value.variable) return code_value;
            }).length - 1;
        };
    })
    .filter('formatVariableCodeValues', function() {
        return function(values, variable_id) {
            codes = values.filter( function(code_value) {   
               if (code_value.code_description && (variable_id.id == code_value.code_description.variable)) return code_value;
                else if (variable_id.id == code_value.variable) return code_value;
            });
            return [codes[0]];
        };
    })
    .filter('formatValue', function() {
        return function(value) {
            if (!value) return '';
            if (value.code_description) return value.code_description.description;
            else return value.coded_value;
        };
    })
    .filter('formatEnvironmentalValues', function () {
        return function(values, variable_id) {
            codes = values.filter( function(environmental_value) {
                if (environmental_value.variable == variable_id) {
                    // TODO why is called this filter twice?
                    // First environmental_value.value is a float un-toFixed(4)
                    // then as string whereby the value is already toFixed(4)
                    try{
                        environmental_value.coded_value_float = environmental_value.coded_value_float.toFixed(4)
                    }catch(e){}
                    return environmental_value;
                }
            });
            return [codes[0]];
        };
    })
    .filter('formatValueSources', function() {
        return function(value) {
            if (!value) return '';
            return value.references.map(function(reference) {
                return reference.name;
            }).join('; ');
        };
    })
    .filter('formatComment', function() {
        return function(code_value) {
            if (!code_value) return '';
            str = '';
            if (code_value.focal_year != 'NA') str = 'Focal Year: ' + code_value.focal_year;
            if (code_value.comment) str += '\n' + code_value.comment;
            return str;
        };
    })
    .filter('formatLanguage', function () {
        return function(language) {
            if (language == null){
                return '';
            } else {
                return language.family.name;
            }
        };
    })
    .filter('formatLanguageTrees', function () {
        return function(values) {
            if (angular.isArray(values)) {
                return values.map(function (language) {
                    return language.name;
                }).join("\n");
            } else {
                return '';
            }
        };
    })
    .filter('formatLanguageName', function () {
        return function(value) {
            if (value === null) {
                return '';
            } else {
                return value.name;
            }
        };
    })
    .filter('countOrBlank', function () {
        return function(value) {
            if (angular.isUndefined(value) || value.length === 0) {
                return '';
            } else {
                return value.length;
            }
        };
    })
    .filter('formatGeographicRegion', function () {
        return function(region) {
            if (region == null) {
                return '';
            } else {
                return region.region_nam;
            }
        };
    });

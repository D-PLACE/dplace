/**
 * Objects for containing search UI state
 * Created by dan on 7/30/14.
 */

function SearchModel(VariableCategory, GeographicRegion, LanguageFamily, DatasetSources, Language) {
    this.reset = function() {
        this.results = {}; // Populated after search is run
        this.params = {}; // state for individual controllers
        this.query = {}; // Parameters sent to the FindSocieties API
        this.results.societies = [];
        this.results.languageTrees = [];
        this.params.culturalTraits = new CulturalTraitModel(VariableCategory, DatasetSources);
        this.params.geographicRegions = new GeographicRegionModel(GeographicRegion);
        this.params.environmentalData = new EnvironmentalDataModel(VariableCategory);
        this.params.languageClassifications = new LanguageClassificationModel(LanguageFamily, Language)
    };

    // getters
    this.getCulturalTraits = function() {
        return this.params.culturalTraits;
    };
    
    this.getGeographicRegions = function() {
        return this.params.geographicRegions;
    };
    this.getEnvironmentalData = function() {
        return this.params.environmentalData;
    };
    this.getLanguageClassifications = function() {
        return this.params.languageClassifications;
    };
    this.getQuery = function() {
        return this.query;
    };

    // Includes the search query
    this.getResults = function() {
        return this.results;
    };
    
    this.getLanguageTrees = function() {
        return this.results.languageTrees;
    };

    // Just the societies object
    this.getSocieties = function() {
        return this.results.societies;
    };
    
    this.checkSelected = function() {
        return this.params.geographicRegions.checkSelected() || this.params.environmentalData.checkSelected()
            || this.params.languageClassifications.checkSelected() || this.params.culturalTraits.checkSelected();
    };

    this.reset();
}

// Cultural trait search
function CulturalTraitModel(VariableCategory, DatasetSources) {
    this.categories = [] //VariableCategory.query(); // these objects get annotated with variables
    this.sources = DatasetSources.query();
    this.selectedVariables = [];
    this.selectedCategory = null;
    this.selectedVariable = null;
    this.badgeValue = 0;
    this.checkSelected = function() {
        for (var i = 0; i < this.selectedVariables.length; i++) {
            if (this.selectedVariables[i].data_type.toLowerCase() == 'continuous') return true;
            if (this.selectedVariables[i].codes.filter(function(c) { return c.isSelected; }).length > 0) return true;
        }
        return false;
    };
}

function GeographicRegionModel(GeographicRegion) {
    this.selectedRegions = [];
    this.allRegions = GeographicRegion.query();
    this.badgeValue = 0;
    this.checkSelected = function() { return this.selectedRegions.length > 0; };
}

function EnvironmentalDataModel(VariableCategory) {
    this.categories = VariableCategory.query({type: 'environmental'});
    this.filters = [
        { operator: 'inrange', name: 'between' },
        { operator: 'lt', name: 'less than'},
        { operator: 'gt', name: 'greater than'},
        { operator: 'outrange', name: 'outside'},
        { operator: 'all', name: 'all values'},
    ];
    this.selectedVariables = [];
    this.badgeValue = 0;
    this.checkSelected = function() {
        for (var i = 0; i < this.selectedVariables.length; i++) {
            if (this.selectedVariables[i].selectedVariable) return true;
        }
        return false;
    };
}

function LanguageClassificationModel(LanguageFamily, Language) {
    /* List of all Language Classes - needed for language search */
    this.allClasses = LanguageFamily.query();
    this.allLanguages = Language.query();
    this.selected = {};
    this.badgeValue = 0;
    this.checkSelected = function () {
        for (var key in this.selected) {
            if (this.selected[key].length > 0) return true;
        }
        return false;
    };
}
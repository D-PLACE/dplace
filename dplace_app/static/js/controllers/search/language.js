function LanguageCtrl($scope, searchModelService) {
    var linkModel = function() {
        // Get a reference to the language classifications from the model
        $scope.languageClassifications = searchModelService.getModel().getLanguageClassifications();
        $scope.families = [$scope.languageClassifications.allClasses];
    };
    $scope.$on('searchModelReset', linkModel); // When model is reset, update our model
    linkModel();
    
    $scope.selectionChanged = function(scheme) {
        if (scheme.selectedFamily.name == 'Select All Languages') scheme.languages = $scope.languageClassifications.allLanguages; //Language.query()
        else scheme.languages = $scope.languageClassifications.allLanguages.filter(function(c) { return c.family.id == scheme.selectedFamily.id; });
        if (!scheme.selectedFamily.alreadySelected) {
            //make select all the default
            scheme.languages.allSelected = true;
            $scope.selectAllChanged(scheme);
            scheme.selectedFamily.alreadySelected = true;
            
            if (scheme.selectedFamily.name == 'Select All Languages') {
                //set all language families as selected so that any changes to the search query are saved
                scheme.forEach (function(f) { f.alreadySelected = true; });
            } 
        } else { //if the user has already selected this language family before, do not alter their selection
            scheme.languages.forEach(function(language) {
                if (!(language.family.name in $scope.languageClassifications.selected)) return;
                if ($scope.languageClassifications.selected[language.family.name].map(function(lang) { return lang.id; }).indexOf(language.id) != -1) { 
                //retrieve user's selection for this family
                    language.isSelected = true;
                } else language.isSelected = false;
            });
            
            //retrieve state for Select All checkbox
            if (scheme.selectedFamily.name == 'Select All Languages') {
                if ($scope.languageClassifications.badgeValue == scheme.selectedFamily.language_count) scheme.languages.allSelected = true;
                else scheme.languages.allSelected = false;
            } else {
                if ((scheme.selectedFamily.name in $scope.languageClassifications.selected) && ($scope.languageClassifications.selected[scheme.selectedFamily.name].length == scheme.languages.length)) scheme.languages.allSelected = true;
                else scheme.languages.allSelected = false;
            }
        }
    };

    $scope.selectAllChanged = function(scheme) {
        if (scheme.languages.allSelected) {
            scheme.languages.forEach(function(language) {
                language.isSelected = true;
                $scope.addToSelection(language);
            });
        } else {
            scheme.languages.forEach(function(language) {
                language.isSelected = false;
                $scope.removeFromSearch(language, 'language');
            });
        }
    };
    
    $scope.addToSelection = function(language) {
        if (!(language.family.name in $scope.languageClassifications.selected)) $scope.languageClassifications.selected[language.family.name] = [];
        if ($scope.languageClassifications.selected[language.family.name].map(function(l) { return l.id; }).indexOf(language.id) == -1) {
            $scope.languageClassifications.selected[language.family.name].push(language);
            $scope.languageClassifications.badgeValue += language.societies.length;
        }
    };

    $scope.classificationSelectionChanged = function(language, scheme) {
        if (language.isSelected) {
            $scope.addToSelection(language);
        } else {
            if (!(language.family.name in $scope.languageClassifications.selected)) return;
            $scope.removeFromSearch(language, 'language');
        }
        
        if (scheme.selectedFamily.name == 'Select All Languages') {
            if ($scope.languageClassifications.badgeValue == scheme.selectedFamily.language_count) scheme.languages.allSelected = true;
            else scheme.languages.allSelected = false;
        } else {
            if ((scheme.selectedFamily.name in $scope.languageClassifications.selected) && ($scope.languageClassifications.selected[scheme.selectedFamily.name].length == scheme.languages.length)) scheme.languages.allSelected = true;
            else scheme.languages.allSelected = false;
        }
    };

    $scope.doSearch = function() {
        $scope.search();
    };
}
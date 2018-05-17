describe('Testing routeProvider', function() {
    beforeEach(module('dplace'));
    
    var location, route, rootScope;
    
    beforeEach(inject(function(_$location_, _$route_, _$rootScope_) {
        location = _$location_;
        route = _$route_;
        rootScope = _$rootScope_;
    }));
    
    describe('Home route', function() {
        beforeEach(inject(function($httpBackend) {
            $httpBackend.whenGET('/static/partials/home.html')
            .respond(200);
            $httpBackend.whenGET('/static/partials/info/about.html')
            .respond(200);
            $httpBackend.whenGET('/static/partials/source_info.html')
            .respond(200);
            $httpBackend.whenGET('/static/partials/info/team.html')
            .respond(200);
            $httpBackend.whenGET('/static/partials/info/legal.html')
            .respond(200);
            $httpBackend.whenGET('/static/partials/info/privacy.html')
            .respond(200);
            $httpBackend.whenGET('/static/partials/info/source.html')
            .respond(200);
            $httpBackend.whenGET('/static/partials/info/technology.html')
            .respond(200);
            $httpBackend.whenGET('/static/partials/info/publication.html')
            .respond(200);
            $httpBackend.whenGET('/static/partials/info/howtocite.html')
            .respond(200);
            $httpBackend.whenGET('/static/partials/search.html')
            .respond(200);
            $httpBackend.whenGET('/static/partials/societies.html')
            .respond(200);
        }));
        
        it('should start on home page', function() {
            location.path('/home');
            rootScope.$digest();
            expect(route.current.controller).toBe('HomeCtrl');
        });
        
        it('should have correct controller for each route', function() {
            location.path('/about');
            rootScope.$digest();
            expect(route.current.controller).toBe('AboutCtrl');
            
            location.path('/howto');
            rootScope.$digest();
            expect(route.current.controller).toBe('SourceInfoCtrl');
            
            location.path('/team');
            rootScope.$digest();
            expect(route.current.controller).toBe('AboutCtrl');
            
            location.path('/legal');
            rootScope.$digest();
            expect(route.current.controller).toBe('AboutCtrl');
            
            location.path('/source');
            rootScope.$digest();
            expect(route.current.controller).toBe('AboutCtrl');
            
            location.path('/technology');
            rootScope.$digest();
            expect(route.current.controller).toBe('AboutCtrl');
            
            location.path('/publication');
            rootScope.$digest();
            expect(route.current.controller).toBe('AboutCtrl');
            
            location.path('/howtocite');
            rootScope.$digest();
            expect(route.current.controller).toBe('AboutCtrl');
            
            location.path('/search');
            rootScope.$digest();
            expect(route.current.controller).toBe('SearchCtrl');
            
            location.path('/societies');
            rootScope.$digest();
            expect(route.current.controller).toBe('SocietiesCtrl');
            
            
        });
    });


});
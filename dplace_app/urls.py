from django.conf.urls import url, include
from django.views.generic.base import RedirectView

from rest_framework import routers
from rest_framework import renderers
from dplace_app import views, api_views

router = routers.DefaultRouter()
router.register(r'variables', api_views.VariableViewSet)
router.register(r'categories', api_views.CategoryViewSet)
router.register(r'codes', api_views.CodeDescriptionViewSet)
router.register(r'values', api_views.ValueViewSet)
router.register(r'societies', api_views.SocietyViewSet)
router.register(r'language_families', api_views.LanguageFamilyViewSet)
router.register(r'languages', api_views.LanguageViewSet)
router.register(r'language_trees', api_views.LanguageTreeViewSet)
router.register(r'geographic_regions', api_views.GeographicRegionViewSet)
router.register(r'sources', api_views.SourceViewSet)
router.register(r'language_tree_labels', api_views.LanguageTreeLabelsViewSet)

urlpatterns = [

    #   !!!!!!  Important  !!!!!!
    #   To reduce traffic caused by bots, spiders, etc
    #   all URL paths with "...?param1=a&param2=b" etc. will return HTTP 404
    #   It's set in:
    #   - "views.py" => def angular(request): [for all pages passed to angular]
    #   - "api_views.py" => def detail(self, request, society_id): [for /society/...?...&]

    url(r'^$', RedirectView.as_view(url='angular/', permanent=True), name='home'),

    # Redirect all static icon images (different sizes) crawled by any sites and bots
    url(r'^favicon\.ico/?$', RedirectView.as_view(url='/static/images/icons/favicon.ico')),
    url(r'^apple\-touch\-icon(\-precomposed)?\.png/?$', RedirectView.as_view(url='/static/images/icons/D-PLACE_Favicon_57x57.png')),
    url(r'^touch\-icon\iphone-\.png/?$', RedirectView.as_view(url='/static/images/icons/D-PLACE_Favicon_57x57.png')),
    url(r'^(apple\-)?touch\-icon\-(?P<size>.+?)(\-precomposed)?\.png/?$', RedirectView.as_view(url='/static/images/icons/D-PLACE_Favicon_%(size)s.png')),
    url(r'^browserconfig\.xml/?$', RedirectView.as_view(url='/static/images/icons/browserconfig.xml')),

    # This is needed in order to auto-generate sitemaps links
    # and to pass only valid paths to angular
    url(r'^home/?$', views.angular),
    url(r'^search/?$', views.angular, name='search'),
    url(r'^societies/?$', views.angular, name='societies'),
    url(r'^about/?$', views.angular, name='about'),
    url(r'^howto/?$', views.angular, name='howto'),
    url(r'^howtocite/?$', views.angular, name='howtocite'),
    url(r'^source/?$', views.angular, name='source'),
    url(r'^technology/?$', views.angular, name='technology'),
    url(r'^legal/?$', views.angular, name='legal'),
    url(r'^privacy/?$', views.angular, name='privacy'),
    url(r'^team/?$', views.angular, name='team'),
    url(r'^publication/?$', views.angular, name='publication'),

    url(r'^society/(?P<society_id>.*)$',
        api_views.SocietyViewSet.as_view(
            {'get': 'detail'},
            renderer_classes=[renderers.TemplateHTMLRenderer]
        ),
        name='view_society'),
    url(r'^language/(?P<glottocode>.*)$',
        views.view_language,
        name='view_language'),
    url(r'^download$', views.download_file, name='download'),
    url(r'^angular/$', views.angular, name='angular'),
    # API
    url(r'^api/v1/', include(router.urls)),
    url(r'^api/v1/find_societies', api_views.find_societies, name='find_societies'),
    url(r'^api/v1/min_and_max', api_views.get_min_and_max, name="min_and_max"),
    url(r'^api/v1/get_categories', api_views.get_categories, name="get_categories"),
    url(r'^api/v1/get_dataset_sources',
        api_views.get_dataset_sources,
        name="get_dataset_sources"),
    url(r'^api/v1/csv_download', api_views.csv_download, name='csv_download'),
    url(r'^api/v1/trees_from_societies', api_views.trees_from_societies, name='trees_from_societies'),

    # catch anything else and let decide angular what to do
    # [is not a good idea for stopping bots]
    # url(r'^.+?/$', views.angular),

]

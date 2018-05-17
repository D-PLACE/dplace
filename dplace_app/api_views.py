import json
import re
import datetime
from itertools import groupby
import logging

from django.db import connection
from django.db.models import Prefetch, Q, Count
from django.shortcuts import get_object_or_404
from django.http import Http404

from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes, renderer_classes
from rest_framework.permissions import AllowAny
from rest_framework.views import Response
from rest_framework.renderers import JSONRenderer

from dplace_app.renderers import DPLACECSVRenderer
from dplace_app import serializers
from dplace_app import models
from dplace_app.tree import update_newick


log = logging.getLogger('profile')


class VariableViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.VariableSerializer
    filter_fields = ('label', 'name', 'index_categories', 'niche_categories', 'source')
    queryset = models.Variable.objects\
        .prefetch_related('index_categories', 'niche_categories')

    # Override retrieve to use the detail serializer, which includes categories
    def retrieve(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = serializers.VariableDetailSerializer(self.object)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.CategorySerializer
    filter_fields = ('name', 'type', 'index_variables', 'niche_variables')
    queryset = models.Category.objects.all()
    # Override retrieve to use the detail serializer, which includes variables

    def retrieve(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = serializers.CategoryDetailSerializer(self.object)
        return Response(serializer.data)


class CodeDescriptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.CodeDescriptionSerializer
    filter_fields = ('variable',)
    queryset = models.CodeDescription.objects.all()


class ValueViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.ValueSerializer
    filter_fields = ('variable', 'coded_value', 'code', 'society',)
    # Avoid additional database trips by select_related for foreign keys
    queryset = models.Value.objects.filter(variable__type='cultural')\
        .select_related('variable', 'code', 'source').all()


class SocietyViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.SocietySerializer
    queryset = models.Society.objects.all().select_related('source', 'language__family')
    lookup_field = 'ext_id'

    def detail(self, request, society_id):
        # block spider attacks
        if len(request.GET) > 0 and request.path.startswith('/society'):
            raise Http404

        society = get_object_or_404(models.Society, ext_id=society_id)
        # gets the society's location for inset map
        location = {}
        if society.location:
            location = {
                'lat': society.location['coordinates'][1],
                'lng': society.location['coordinates'][0]
            }

        # gets other societies in database with the same xd_id
        xd_id = models.Society.objects.filter(
            xd_id=society.xd_id).exclude(ext_id=society_id)
        if society.hraf_link and '(' in society.hraf_link:
            length = len(society.hraf_link.split('(')) - 1
            hraf_link = society.hraf_link.split('(')[length]
        else:
            hraf_link = ''
        environmentals = society.get_environmental_data()
        cultural_traits = society.get_cultural_trait_data()
        references = society.get_data_references()
        language_classification = None
        
        if society.language:
            # just glottolog at the moment
            language_classification = models.LanguageFamily.objects\
                .filter(name=society.language.family.name)

        return Response(
            {
                'society': society,
                'hraf_link': hraf_link[0:len(hraf_link) - 1],
                'xd_id': xd_id,
                'location': location,
                'language_classification': language_classification,
                'environmentals': dict(environmentals),
                'cultural_traits': dict(cultural_traits),
                'references': references
            },
            template_name='society.html'
        )


class LargeResultsSetPagination(PageNumberPagination):
    page_size = 1000
    page_size_query_param = 'page_size'
    max_page_size = 1000


class VeryLargeResultsSetPagination(PageNumberPagination):
    page_size = 3000
    # do not set: page_size_query_param = 'page_size'
    # it sets page_size to default 1000 - internal bug??
    max_page_size = 3000


class LanguageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.LanguageSerializerWithSocieties
    filter_fields = ('name', 'iso_code', 'societies', 'family',)
    queryset = models.Language.objects.all()\
        .select_related('family')\
        .prefetch_related(Prefetch(
            'societies',
            queryset=models.Society.objects.exclude(value__isnull=True)
        ))
    # 'Select All Languages' has to return a list with more than 1000 items
    pagination_class = VeryLargeResultsSetPagination


class LanguageFamilyViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.LanguageFamilySerializer
    filter_fields = ('name',)
    queryset = models.LanguageFamily.objects.all()\
        .annotate(language_count=Count('language__societies'))\
        .order_by('name')
    pagination_class = LargeResultsSetPagination


class TreeResultsSetPagination(PageNumberPagination):
    """
    Since trees may have *many* languages, which are serialized as well, we
    limit the page size to just 1.
    """
    page_size = 3
    page_size_query_param = 'page_size'
    max_page_size = 10


class LanguageTreeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.LanguageTreeSerializer
    filter_fields = ('name',)
    queryset = models.LanguageTree.objects.all()
    pagination_class = TreeResultsSetPagination


class LanguageTreeLabelsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.LanguageTreeLabelsSerializer
    filter_fields = ('label',)
    queryset = models.LanguageTreeLabels.objects.all()
    pagination_class = LargeResultsSetPagination


class SourceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.SourceSerializer
    filter_fields = ('author', 'name')
    queryset = models.Source.objects.all()


def get_query_from_json(request):
    query_string = request.query_params.get('query')
    if query_string is None:
        raise Http404('missing query parameter')
    try:
        query_dict = json.loads(query_string)
    except ValueError:
        raise Http404('malformed query parameter')
    if not isinstance(query_dict, dict):
        raise Http404('malformed query parameter')
    return query_dict


def result_set_from_query_dict(query_dict):
    from time import time
    _s = time()
    log.info('enter result_set_from_query_dict')

    result_set = serializers.SocietyResultSet()
    sql_joins, sql_where = [], []

    def id_array(l):
        return '(%s)' % ','.join('%s' % int(i) for i in l)
        
    def join_values(varid, criteria):
        alias = 'ev%s' % varid
        sql_joins.append((
            "value",
            alias,
            "{0}.society_id = s.id AND {0}.variable_id = {1}".format(alias, int(varid))))

        for varid, operator, params in criteria:
            if operator != 'categorical':
                params = map(float, params)
            if operator == 'inrange' or operator == 'all':
                sql_where.append("{0}.coded_value_float >= {1:f} AND {0}.coded_value_float <= {2:f}".format(alias, params[0], params[1]))
            elif operator == 'outrange':
                sql_where.append("{0}.coded_value_float >= {1:f} OR {0}.coded_value_float <= {2:f}".format(alias, params[1], params[0]))
            elif operator == 'gt':
                sql_where.append("{0}.coded_value_float >= {1:f}".format(alias, params[0]))
            elif operator == 'lt':
                sql_where.append("{0}.coded_value_float <= {1:f}".format(alias, params[1]))
            elif operator == 'categorical':
                sql_where.append("{0}.code_id IN %s".format(alias) % id_array(params))

    if 'l' in query_dict:
        sql_joins.append(('language', 'l', 'l.id = s.language_id'))
        sql_where.append('l.id IN ' + id_array(query_dict['l']))
        for lang in models.Language.objects.filter(id__in=query_dict['l']):
            result_set.languages.add(lang)

    if 'c' in query_dict:
        variables = {
            v.id: v for v in models.Variable.objects
            .filter(id__in=[x[0] for x in query_dict['c']])
            .prefetch_related(Prefetch(
                'codes',
                queryset=models.CodeDescription.objects
                .filter(id__in=[x[0] for x in query_dict['c']])))
        }

        for varid, criteria in groupby(
            sorted(query_dict['c'], key=lambda c: c[0]),
            key=lambda x: x[0]
        ):
            join_values(varid, criteria)

        for variable in models.Variable.objects.filter(id__in=[x[0] for x in query_dict['c']]):
            result_set.variable_descriptions.add(serializers.VariableCode(variable.codes, variable))

    if 'e' in query_dict:
        variables = {
            v.id: v for v in models.Variable.objects
            .filter(id__in=[x[0] for x in query_dict['e']])
            .prefetch_related(Prefetch(
                'codes',
                queryset=models.CodeDescription.objects
                .filter(id__in=[x[0] for x in query_dict['e']])))
        }

        # There can be multiple filters, so we must aggregate the results.
        for varid, criteria in groupby(
            sorted(query_dict['e'], key=lambda c: c[0]),
            key=lambda x: x[0]
        ):
            join_values(varid, criteria)

        for variable in models.Variable.objects.filter(id__in=[x[0] for x in query_dict['e']]):
            result_set.environmental_variables.add(serializers.VariableCode(variable.codes, variable))

    if 'p' in query_dict:
        sql_joins.append(('geographicregion', 'r', 'r.id = s.region_id'))
        sql_where.append('r.id IN %s' % id_array(query_dict['p']))
        for region in models.GeographicRegion.objects.filter(id__in=query_dict['p']):
            result_set.geographic_regions.add(region)

    if sql_where:
        cursor = connection.cursor()
        sql = "select distinct s.id from dplace_app_society as s %s where %s" % (
            ' '.join('join dplace_app_%s as %s on %s' % t for t in sql_joins),
            ' AND '.join(sql_where))
        cursor.execute(sql)
        soc_ids = [r[0] for r in cursor.fetchall()]
    else:
        soc_ids = []

    soc_query = models.Society.objects.filter(id__in=soc_ids)\
        .select_related('source', 'language__family', 'region')
    if result_set.geographic_regions:
        soc_query = soc_query.select_related('region')
    if result_set.variable_descriptions:
        soc_query = soc_query.prefetch_related(Prefetch(
            'value_set',
            to_attr='selected_cvalues',
            queryset=models.Value.objects
            # FIXME: this selects possibly too many values, in case there are multiple
            # values for the same variable, not all of them matching the criteria.
            .filter(variable_id__in=[v.variable.id for v in result_set.variable_descriptions])
            .select_related('code')
            .prefetch_related('references')))
    if result_set.environmental_variables:
        soc_query = soc_query.prefetch_related(Prefetch(
            'value_set',
            to_attr='selected_evalues',
            queryset=models.Value.objects
            .filter(variable_id__in=[v.variable.id for v in result_set.environmental_variables])
            .prefetch_related('references')))

    for i, soc in enumerate(soc_query):
        soc_result = serializers.SocietyResult(soc)
        if result_set.variable_descriptions:
            for cval in soc.selected_cvalues:
                soc_result.variable_coded_values.add(cval)
                result_set.sources = result_set.sources.union(
                    r.source_id for r in cval.references.all())
        if result_set.environmental_variables:
            for eval in soc.selected_evalues:
                soc_result.environmental_values.add(eval)
                result_set.sources = result_set.sources.union(
                    r.source_id for r in eval.references.all())
        result_set.societies.add(soc_result)
    result_set.sources = models.Source.objects.filter(id__in=result_set.sources).all()

    log.info('mid 1: %s' % (time() - _s,))

    # Filter the results to those that matched all criteria
    #result_set.finalize(criteria)
    log.info('mid 2: %s' % (time() - _s,))
    return result_set


@api_view(['GET'])
@permission_classes((AllowAny,))
def trees_from_societies(request):
    language_trees, labels, soc_ids = [], [], []

    for k, v in request.query_params.lists():
        soc_ids = v
        labels = models.LanguageTreeLabels.objects.filter(societies__id__in=soc_ids).all()

    for t in models.LanguageTree.objects\
            .filter(taxa__societies__id__in=soc_ids)\
            .prefetch_related(
                'taxa__languagetreelabelssequence_set__labels',
                'taxa__languagetreelabelssequence_set__society',
            )\
            .distinct():
        if update_newick(t, labels):
            language_trees.append(t)

    return Response(serializers.LanguageTreeSerializer(language_trees, many=True).data)


@api_view(['GET'])
@permission_classes((AllowAny,))
def find_societies(request):
    """
    View to find the societies that match an input request.  Currently expects
    { language_filters: [{language_ids: [1,2,3]}], variable_codes: [4,5,6...],
    environmental_filters: [{id: 1, operator: 'gt', params: [0.0]},
    {id:3, operator 'inrange', params: [10.0,20.0] }] }

    Returns serialized collection of SocietyResult objects
    """
    from time import time
    from django.db import connection
    s = time()
    log.info('%s find_societies 1: %s queries' % (time() - s, len(connection.queries)))
    query = {}
    if 'name' in request.query_params:
        result_set = serializers.SocietyResultSet()
        q = request.query_params['name']
        if q:
            soc = models.Society.objects.filter(
                Q(name__icontains=q) | Q(alternate_names__unaccent__icontains=q))
            for s in soc:
                if s.value_set.count():
                    result_set.societies.add(serializers.SocietyResult(s))
        return Response(serializers.SocietyResultSetSerializer(result_set).data)

    for k, v in request.query_params.lists():
        #if str(k) == 'c':
        #    query[k] = v
        #else:
        query[k] = [json.loads(vv) for vv in v]
    result_set = result_set_from_query_dict(query)
    log.info('%s find_societies 2: %s queries' % (time() - s, len(connection.queries)))
    d = serializers.SocietyResultSetSerializer(result_set).data
    log.info('%s find_societies 3: %s queries' % (time() - s, len(connection.queries)))
    for i, q in enumerate(
            sorted(connection.queries, key=lambda q: q['time'], reverse=True)):
        if 10 < i < 20:  # pragma: no cover
            log.info('%s for %s' % (q['time'], q['sql'][:500]))
    return Response(d)


@api_view(['GET'])
@permission_classes((AllowAny,))
def get_categories(request):
    """
    Filters categories for sources, as some categories are empty for some sources
    """
    query_dict = get_query_from_json(request)
    categories = models.Category.objects.all()
    if 'source' in query_dict:
        category_ids = models.Variable.objects\
                .filter(source__id=query_dict['source'])\
                .prefetch_related('index_categories')\
                .values_list('index_categories__id', flat=True)
        categories = categories.filter(type='cultural', id__in=category_ids)
    return Response(serializers.CategorySerializer(categories, many=True).data)


@api_view(['GET'])
@permission_classes((AllowAny,))
def get_dataset_sources(request):
    return Response(
        serializers.SourceSerializer(
            models.Source.objects.filter(societies__isnull=False).distinct(),
            many=True).data)


class GeographicRegionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.GeographicRegionSerializer
    model = models.GeographicRegion
    filter_fields = ('region_nam', 'continent')
    queryset = models.GeographicRegion.objects.all()


@api_view(['GET'])
@permission_classes((AllowAny,))
@renderer_classes((JSONRenderer,))
def get_min_and_max(request):
    res = {}
    varid = get_query_from_json(request).get('id')
    if varid:
        values = [
            v.coded_value_float for v in models.Value.objects.filter(variable__id=varid)
            if v.coded_value_float is not None]
        vmin = min(values) if values else 0.0
        vmax = max(values) if values else 0.0
        res = {'min': format(vmin, '.4f'), 'max': format(vmax, '.4f')}
    return Response(res)

@api_view(['GET'])
@permission_classes((AllowAny,))
@renderer_classes((DPLACECSVRenderer,))
def csv_download(request):
    query_dict = get_query_from_json(request)
    result_set = result_set_from_query_dict(query_dict)
    response = Response(serializers.SocietyResultSetSerializer(result_set).data)
    filename = "dplace-societies-%s.csv" % datetime.datetime.now().strftime("%Y-%m-%d")
    response['Content-Disposition'] = 'attachment; filename="%s"' % filename
    return response

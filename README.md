# D-PLACE  

[![Build Status](https://travis-ci.org/D-PLACE/dplace.svg?branch=master)](https://travis-ci.org/D-PLACE/dplace)
[![codecov](https://codecov.io/gh/D-PLACE/dplace/branch/master/graph/badge.svg)](https://codecov.io/gh/D-PLACE/dplace)

## Synopsis

This repository contains a [Django](http://djangoproject.com) application for the D-PLACE Project. 

**Please Note that this application has been superseded by [https://github.com/clld/dplace2](https://github.com/clld/dplace2)**

Research that uses data from D-PLACE should cite both the original source(s) of
the data and the paper by Kirby et al. in which D-PLACE was first presented
(e.g., research using cultural data from the Binford Hunter-Gatherer dataset:
"Binford (2001); Binford and Johnson (2006); Kirby et al. 2016)." The reference
list should include the date data were accessed and URL for D-PLACE
(https://d-place.org), in addition to the full references for Binford (2001),
Binford and Johnson (2006), and Kirby et al. 2016.


## Installation

### Vagrant/Ansible

For development purposes, the [Vagrant+Ansible](https://github.com/dleehr/dplace-vagrant) configuration is recommended. It automates the build of an Ubuntu Linux VM with D-PLACE installed and ready for testing/development.

Additionally, the Ansible playbook creates OS and database users for D-PLACE, installs all software dependencies, and populates the database from the working group's data sets. You can use ansible by itself to provision D-PLACE on a host, or study the [playbooks](https://github.com/dleehr/ansible-postgresql/tree/master/roles/dplace_server/tasks) as a recipe.

The rest of the information on this page assumes you are not using the [Vagrant+Ansible](https://github.com/dleehr/dplace-vagrant) configuration.

### Dependencies

D-PLACE requires Postgres with the PostGIS extension installed. Both versions 9.2 and 9.3 have been used for development.

D-PLACE also requires the following software:

- Git
- Python (2.7 preferred)
- python-psycopg2 (for connecting to Postgres)
- Postgres with the `unaccent` extension.

D-PLACE has been developed on Mac OS X 10.9 as well as Ubuntu Server 12.04.

### Cloning the repository

If you plan to do development, you should fork the GitHub repo first, and work with that.

`git clone git@github.com:D-PLACE/dplace.git` (or your fork)

### Python Dependencies

For best results, install python dependencies for D-PLACE in a [virtualenv](http://virtualenv.readthedocs.org/en/latest/)

The python dependencies are specified in the `requirements.txt` file. 

Activate your virtualenv `source /env/bin/activate` and install dependencies with `pip install -r requirements.txt`

### Javascript Dependencies

D-PLACE uses a few JavaScript libraries, which are stored in `dplace_app/static`.  Though all the required JavaScript libraries are contained in the source repository, they can be managed/updated with [Bower](http://bower.io). The `bower.json` file specifies dependencies and versions.

### Initial Configuration

#### settings.py

With dependencies installed and a clone of the source repository in place, the next step is to create a `settings.py` file:

		cp dplace/settings.template dplace/settings.py
		<edit> settings.py

Be sure to update the following sections:

1. `ADMINS`: Name and email address of site administrator(s)
2. `DATABASES`: Connection info and credentials for PostgreSQL host
3. `TEMPLATE_DIRS`: Absolute local path to `dplace_app/templates`
4. `STATICFILES_DIRS`: Absolute local path to `dplace_app/static`
5. `DATASETS`: Names of datasets to install.

#### Database installation

To install the database, run

	make install

This requires valid database credentials in `settings.py`, and activation of your virtualenv if enabled.

## Development

### Architecture

D-PLACE is mainly built with [Django](http://djangoproject.com) and [AngularJS](http://angularjs.org). Django is used to model/query data stored in the relational GIS database, and AngularJS is used to build a JavaScript-based browser application that provides an interface to the data. The [Django REST Framework](http://django-rest-framework.org) is used to build a JSON API between Django and AngularJS.

#### Django REST Framework - REST API

The Django REST Framework is a powerful framework for building RESTful web services in Django. API endpoints are created as Django views, and can either be [class-based](https://docs.djangoproject.com/en/1.6/topics/class-based-views/) or [function](https://docs.djangoproject.com/en/1.6/topics/http/views/) views. In either case, the framework provides a lot of the functionality. API views are created in `dplace_app/api_views.py` and connected to URLs in `dplace_app/urls.py`

Most of the Models are exposed as simple `ReadOnlyModelViewSet`s, which means the REST framework creates methods to list all objects and get individual objects.

In order to convert data between JSON (or XML) and Python model objects, the REST framework uses serializers. These are classes located in `dplace_app/serializers.py`, and they describe what fields and related objects to include when serializing an object to JSON. Serializers can also represent arbitrary (non-model-backed) objects like search queries or results.

#### AngularJS - Client Application

Most of the D-PLACE user interface is a single-page application written in JavaScript and HTML, powered by AngularJS and Bootstrap.

AngularJS is a JavaScript web framework with features like 2-way data-binding and native support for RESTful JSON APIs.

The front-end application code is primarily in `dplace_app/static`, except for the entry-point template at `dplace_app/templates/angular.html`. This template is served by Django and includes all necessary JavaScript and CSS files for the AngularJS app.

As a best practice, avoid putting AngularJS code into Django templates. This could result in collisions between Angular's template language and Django's. The `angular.html` template should only be used to include JavaScript files and other resources that must be present at startup.

### Loading Data

D-PLACE data is collected/curated by the Working Group, and periodic CSV exports have been stored in a [private Github repository](https://github.com/D-PLACE/dplace-data). 

To load the data, run the `load_all_datasets.sh` script. This scripts clones the [dplace-data](https://github.com/D-PLACE/dplace-data) repository, and installs the latest data.

The [Vagrant+Ansible](https://github.com/D-PLACE/dplace-vagrant) configuration will perform the first data load, but this step can be repeated to load new data.

### Running Tests

D-PLACE uses Django's built-in testing framework, tests can be run with

	python manage.py test
        
The front-end tests can be run with `node`:

	npm test

All the tests can be run at the same time by running:

	make test


### Running Development Server

To run the built-in django web server, run

        python manage.py runserver 0.0.0.0:8000
        
which will make the app available at [http://localhost:8000](http://localhost:8000).

## Production installation

The Django project advises not to use the built-in webserver for production deployments. While they don't provide a bundled production-ready server, they do have [deployment documentation](https://docs.djangoproject.com/en/dev/howto/deployment/).

### Caveats

Though Django supports placing the `STATIC_ROOT` anywhere on the server (Templates should be using `{% static %}` instead of hard-coding URLs), many of the AngularJS files reference resources with an absolute path like `/static/partials/search/...`, which could break.

## Contributing

For code changes, please fork the repository and submit a pull request. For bugs or feature requests, please create a [GitHub issue](https://github.com/D-PLACE/dplace/issues).

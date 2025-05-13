import pandas as pd
import json
import csv
import io
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import base64
from io import BytesIO

from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.contrib import messages
from django.views.decorators.http import require_POST
from django.core.serializers import serialize
from django.db.models import Count, Sum, F, Q, Case, When, Value, IntegerField
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

from .models import (
    EndemicTree, MapLayer, UserSetting, TreeFamily,
    TreeGenus, TreeSpecies, Location, PinStyle
)
from .forms import (
    EndemicTreeForm, CSVUploadForm, ThemeSettingsForm,
    PinStyleForm, LocationForm
)


def get_setting(key, default=None):
    """Helper function to get a setting value"""
    try:
        return UserSetting.objects.get(key=key).value
    except UserSetting.DoesNotExist:
        return default


def splash_screen(request):
    """
    Initial splash screen that redirects to dashboard
    """
    return render(request, 'app/splash.html')


def user_login(request):
    """
    Handle user login
    """
    if request.user.is_authenticated:
        return redirect('app:dashboard')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, f"Welcome back, {username}!")

            # Redirect to the page they were trying to access, or dashboard
            next_page = request.GET.get('next', 'app:dashboard')
            return redirect(next_page)
        else:
            return render(request, 'app/login.html', {
                'error_message': 'Invalid username or password',
                'theme': get_setting('theme', 'dark')
            })

    return render(request, 'app/login.html', {
        'theme': get_setting('theme', 'dark')
    })


def user_logout(request):
    """
    Handle user logout
    """
    logout(request)
    messages.success(request, "You have been logged out successfully.")
    return redirect('app:login')


def register(request):
    """
    Handle user registration
    """
    if request.user.is_authenticated:
        return redirect('app:dashboard')

    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        # Validate form data
        if password1 != password2:
            return render(request, 'app/register.html', {
                'error_message': 'Passwords do not match',
                'theme': get_setting('theme', 'dark')
            })

        if User.objects.filter(username=username).exists():
            return render(request, 'app/register.html', {
                'error_message': 'Username already exists',
                'theme': get_setting('theme', 'dark')
            })

        if User.objects.filter(email=email).exists():
            return render(request, 'app/register.html', {
                'error_message': 'Email already exists',
                'theme': get_setting('theme', 'dark')
            })

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password1
        )

        # Log the user in
        login(request, user)
        messages.success(request, f"Account created successfully. Welcome, {username}!")
        return redirect('app:dashboard')

    return render(request, 'app/register.html', {
        'theme': get_setting('theme', 'dark')
    })


@login_required(login_url='app:login')
def dashboard(request):
    """
    Main dashboard view
    """
    # Get basic stats for dashboard
    total_trees = EndemicTree.objects.count()
    unique_species = TreeSpecies.objects.count()
    tree_population = EndemicTree.objects.aggregate(Sum('population'))['population__sum'] or 0

    # Calculate health percentage (trees in good health or better)
    good_health_count = EndemicTree.objects.filter(
        health_status__in=['good', 'very_good', 'excellent']
    ).count()

    health_percentage = 0
    if total_trees > 0:
        health_percentage = round((good_health_count / total_trees) * 100)

    # Get health status distribution for chart
    health_data = list(EndemicTree.objects.values('health_status').annotate(
        count=Count('id')
    ).order_by('health_status'))

    # Get most recent data
    recent_trees = EndemicTree.objects.select_related('species', 'location').all().order_by('-created_at')[:5]

    # Get species by family for chart
    species_by_family = TreeSpecies.objects.values(
        'genus__family__name'
    ).annotate(
        count=Count('id')
    ).order_by('-count')[:10]

    # Get population by year
    population_by_year = EndemicTree.objects.values('year').annotate(
        total=Sum('population')
    ).order_by('year')

    context = {
        'active_page': 'dashboard',
        'total_trees': total_trees,
        'unique_species': unique_species,
        'tree_population': tree_population,
        'health_percentage': health_percentage,
        'recent_trees': recent_trees,
        'species_by_family': json.dumps(list(species_by_family)),
        'population_by_year': json.dumps(list(population_by_year)),
        'health_data': json.dumps(list(health_data)),
    }
    return render(request, 'app/dashboard.html', context)


@login_required(login_url='app:login')
def gis(request):
    """
    GIS Map view
    """
    # Get all available map layers
    layers = MapLayer.objects.filter(is_active=True)

    # Get all unique tree species for filter
    tree_species = TreeSpecies.objects.all().order_by('common_name')

    # Get default pin style
    try:
        default_pin = PinStyle.objects.get(is_default=True)
    except PinStyle.DoesNotExist:
        default_pin = None

    context = {
        'active_page': 'gis',
        'layers': layers,
        'tree_species': tree_species,
        'default_pin': default_pin,
    }
    return render(request, 'app/gis.html', context)


@login_required(login_url='app:login')
def analytics(request):
    """
    Analytics and visualization view
    """
    # Get data for analytics
    species_count = TreeSpecies.objects.annotate(
        tree_count=Count('trees')
    ).order_by('-tree_count')[:10]

    population_by_year = EndemicTree.objects.values('year').annotate(
        total=Sum('population')
    ).order_by('year')

    # Get health status distribution
    health_status_data = list(EndemicTree.objects.values('health_status').annotate(
        count=Count('id')
    ).order_by('health_status'))

    # Get health status by year
    health_by_year_data = list(EndemicTree.objects.values('year', 'health_status').annotate(
        count=Count('id')
    ).order_by('year', 'health_status'))

    # Convert to JSON for JavaScript charts
    species_data = json.dumps([{
        'species': s.common_name,
        'count': s.tree_count
    } for s in species_count])

    population_data = json.dumps(list(population_by_year))

    # Create matplotlib/seaborn charts
    # Population distribution by family
    plt.figure(figsize=(10, 6))
    plt.style.use('dark_background')

    # Get family population data
    family_data = TreeSpecies.objects.values(
        'genus__family__name'
    ).annotate(
        population=Sum('trees__population')
    ).order_by('-population')[:10]

    if family_data:
        df = pd.DataFrame(list(family_data))
        if not df.empty:
            sns.barplot(x='genus__family__name', y='population', data=df)
            plt.title('Population by Family', color='white')
            plt.xlabel('Family', color='white')
            plt.ylabel('Population', color='white')
            plt.xticks(rotation=45)
            plt.tight_layout()

            # Save plot to a temporary buffer
            buffer = BytesIO()
            plt.savefig(buffer, format='png', transparent=True)
            buffer.seek(0)
            plot_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
            plt.close()
        else:
            plot_data = None
    else:
        plot_data = None

    context = {
        'active_page': 'analytics',
        'species_data': species_data,
        'population_data': population_data,
        'plot_data': plot_data,
        'health_status_data': json.dumps(health_status_data),
        'health_by_year_data': json.dumps(health_by_year_data),
    }
    return render(request, 'app/analytics.html', context)


@login_required(login_url='app:login')
def layers(request):
    """
    Layer control view
    """
    layers = MapLayer.objects.all()

    context = {
        'active_page': 'layers',
        'layers': layers,
    }
    return render(request, 'app/layers.html', context)


@login_required(login_url='app:login')
def datasets(request):
    """
    Display and manage datasets
    """
    trees = EndemicTree.objects.select_related('species', 'location').all()

    context = {
        'active_page': 'datasets',
        'trees': trees,
    }
    return render(request, 'app/datasets.html', context)


@login_required(login_url='app:login')
def upload_data(request):
    """
    Handle file uploads and manual data entry
    """
    tree_form = EndemicTreeForm()
    csv_form = CSVUploadForm()

    if request.method == 'POST':
        if 'submit_csv' in request.POST:
            csv_form = CSVUploadForm(request.POST, request.FILES)
            if csv_form.is_valid():
                csv_file = request.FILES['csv_file']

                # Check if file is CSV
                if not csv_file.name.endswith('.csv'):
                    messages.error(request, 'File must be a CSV file')
                    return redirect('app:upload')

                # Process CSV file
                try:
                    df = pd.read_csv(csv_file)
                    required_columns = ['common_name', 'scientific_name', 'family', 'genus', 'population', 'latitude',
                                        'longitude', 'year']

                    # Check if all required columns exist
                    missing_columns = [col for col in required_columns if col not in df.columns]
                    if missing_columns:
                        messages.error(request, f'Missing required columns: {", ".join(missing_columns)}')
                        return redirect('app:upload')

                    # Process each row and save to database
                    success_count = 0
                    error_count = 0

                    for _, row in df.iterrows():
                        try:
                            # Get or create family
                            family, _ = TreeFamily.objects.get_or_create(name=row['family'])

                            # Get or create genus
                            genus, _ = TreeGenus.objects.get_or_create(
                                name=row['genus'],
                                defaults={'family': family}
                            )

                            # Get or create species
                            species, _ = TreeSpecies.objects.get_or_create(
                                scientific_name=row['scientific_name'],
                                defaults={
                                    'common_name': row['common_name'],
                                    'genus': genus
                                }
                            )

                            # Get or create location
                            location, _ = Location.objects.get_or_create(
                                latitude=row['latitude'],
                                longitude=row['longitude'],
                                defaults={'name': f"{row['common_name']} location"}
                            )

                            # Create tree record
                            notes = row.get('notes', '')
                            health_status = row.get('health_status', 'good')

                            tree = EndemicTree(
                                species=species,
                                location=location,
                                population=row['population'],
                                year=row['year'],
                                health_status=health_status,
                                notes=notes
                            )
                            tree.save()
                            success_count += 1
                        except Exception as e:
                            error_count += 1
                            print(f"Error processing row: {str(e)}")

                    messages.success(request, f'Successfully imported {success_count} trees. {error_count} errors.')
                    # Redirect to GIS page to see the newly added data
                    return redirect('app:gis')
                except Exception as e:
                    messages.error(request, f'Error processing CSV file: {str(e)}')
                    return redirect('app:upload')

        elif 'submit_manual' in request.POST:
            try:
                # Get form data
                common_name = request.POST.get('common_name')
                scientific_name = request.POST.get('scientific_name')
                family_name = request.POST.get('family')
                genus_name = request.POST.get('genus')
                population = int(request.POST.get('population'))
                health_status = request.POST.get('health_status')
                latitude = float(request.POST.get('latitude'))
                longitude = float(request.POST.get('longitude'))
                year = int(request.POST.get('year'))
                notes = request.POST.get('notes', '')

                # Get or create family
                family, created = TreeFamily.objects.get_or_create(name=family_name)

                # Get or create genus
                genus, created = TreeGenus.objects.get_or_create(
                    name=genus_name,
                    defaults={'family': family}
                )

                # Get or create species
                species, created = TreeSpecies.objects.get_or_create(
                    scientific_name=scientific_name,
                    defaults={
                        'common_name': common_name,
                        'genus': genus
                    }
                )

                # Get or create location
                location, created = Location.objects.get_or_create(
                    latitude=latitude,
                    longitude=longitude,
                    defaults={'name': f"{common_name} Location"}
                )

                # Create endemic tree record
                tree = EndemicTree.objects.create(
                    species=species,
                    location=location,
                    population=population,
                    health_status=health_status,
                    year=year,
                    notes=notes
                )

                messages.success(request, f"Successfully added {common_name} record.")
                # Redirect to GIS page to see the newly added data
                return redirect('app:gis')
            except Exception as e:
                messages.error(request, f"Error adding record: {str(e)}")
                print(f"Error in manual entry: {str(e)}")

    # Get all families and genera for the form
    families = TreeFamily.objects.all()
    genera = TreeGenus.objects.all()

    context = {
        'active_page': 'upload',
        'tree_form': tree_form,
        'csv_form': csv_form,
        'families': families,
        'genera': genera,
    }
    return render(request, 'app/upload.html', context)


@login_required(login_url='app:login')
def settings(request):
    """
    Application settings
    """
    # Get all pin styles
    pin_styles = PinStyle.objects.all()

    # Create a new pin style form
    pin_style_form = PinStyleForm()

    # Initialize form with current settings
    try:
        current_theme = UserSetting.objects.get(key='theme').value
    except UserSetting.DoesNotExist:
        current_theme = 'dark'  # Default

    try:
        current_map_style = UserSetting.objects.get(key='map_style').value
    except UserSetting.DoesNotExist:
        current_map_style = 'dark'  # Default

    try:
        current_pin_style = PinStyle.objects.get(is_default=True)
    except PinStyle.DoesNotExist:
        if pin_styles.exists():
            current_pin_style = pin_styles.first()
        else:
            # Create a default pin style if none exists
            current_pin_style = PinStyle.objects.create(
                name="Default Green Tree",
                icon_class="fa-tree",
                color="#4caf50",
                size=24,
                border_color="#ffffff",
                border_width=2,
                background_color="rgba(0, 0, 0, 0.6)",
                is_default=True
            )

    # Get other settings
    enable_animations = get_setting('enable_animations', 'true') == 'true'
    high_contrast = get_setting('high_contrast', 'false') == 'true'
    font_size = int(get_setting('font_size', '100'))
    default_zoom = int(get_setting('default_zoom', '9'))
    show_scientific_names = get_setting('show_scientific_names', 'true') == 'true'

    initial_data = {
        'theme': current_theme,
        'map_style': current_map_style,
        'pin_style': current_pin_style.id,
        'enable_animations': enable_animations,
        'high_contrast': high_contrast,
        'font_size': font_size,
        'default_zoom': default_zoom,
        'show_scientific_names': show_scientific_names,
    }

    form = ThemeSettingsForm(initial=initial_data)

    if request.method == 'POST':
        if 'save_settings' in request.POST:
            form = ThemeSettingsForm(request.POST)
            if form.is_valid():
                # Save all settings
                settings_to_save = {
                    'theme': form.cleaned_data['theme'],
                    'map_style': form.cleaned_data['map_style'],
                    'enable_animations': str(form.cleaned_data['enable_animations']).lower(),
                    'high_contrast': str(form.cleaned_data['high_contrast']).lower(),
                    'font_size': str(form.cleaned_data['font_size']),
                    'default_zoom': str(form.cleaned_data['default_zoom']),
                    'show_scientific_names': str(form.cleaned_data['show_scientific_names']).lower(),
                }

                for key, value in settings_to_save.items():
                    UserSetting.objects.update_or_create(
                        key=key,
                        defaults={'value': value}
                    )

                # Set default pin style
                pin_style = form.cleaned_data['pin_style']
                pin_style.is_default = True
                pin_style.save()

                messages.success(request, 'Settings updated successfully!')
                return redirect('app:settings')

        elif 'add_pin_style' in request.POST:
            pin_style_form = PinStyleForm(request.POST)
            if pin_style_form.is_valid():
                pin_style_form.save()
                messages.success(request, 'New pin style added successfully!')
                return redirect('app:settings')

    context = {
        'active_page': 'settings',
        'form': form,
        'pin_styles': pin_styles,
        'pin_style_form': pin_style_form,
    }
    return render(request, 'app/settings.html', context)


@login_required(login_url='app:login')
def about(request):
    """
    About page
    """
    context = {
        'active_page': 'about',
    }
    return render(request, 'app/about.html', context)


@login_required(login_url='app:login')
def reports(request):
    """View for generating reports."""
    return render(request, 'app/reports.html', {'active_page': 'reports'})


# API Views
def tree_data(request):
    """
    API endpoint for tree data in GeoJSON format
    """
    try:
        trees = EndemicTree.objects.select_related('species', 'location').all()

        # Log the count of trees for debugging
        tree_count = trees.count()
        print(f"Found {tree_count} trees in the database")

        # Get pin style
        try:
            pin_style = PinStyle.objects.get(is_default=True)
        except PinStyle.DoesNotExist:
            pin_style = None

        # Convert to GeoJSON format
        features = []
        for tree in trees:
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [tree.location.longitude, tree.location.latitude]
                },
                'properties': {
                    'id': str(tree.id),
                    'species_id': str(tree.species.id),  # Add species_id for filtering
                    'common_name': tree.species.common_name,
                    'scientific_name': tree.species.scientific_name,
                    'family': tree.species.genus.family.name,
                    'genus': tree.species.genus.name,
                    'population': tree.population,
                    'health_status': tree.health_status,
                    'year': tree.year,
                    'location': tree.location.name,
                    'notes': tree.notes or ''
                }
            }
            features.append(feature)

        geojson = {
            'type': 'FeatureCollection',
            'features': features
        }

        # Add pin style to response
        if pin_style:
            geojson['pin_style'] = {
                'icon_class': pin_style.icon_class,
                'color': pin_style.color,
                'size': pin_style.size,
                'border_color': pin_style.border_color,
                'border_width': pin_style.border_width,
                'background_color': pin_style.background_color
            }

        return JsonResponse(geojson)
    except Exception as e:
        print(f"Error in tree_data API: {str(e)}")
        return JsonResponse({
            'type': 'FeatureCollection',
            'features': [],
            'error': str(e)
        }, status=500)


def filter_trees(request, species_id):
    """
    API endpoint for filtered tree data
    """
    try:
        # Check if the species exists first
        species = get_object_or_404(TreeSpecies, id=species_id)

        # Get trees for this species
        trees = EndemicTree.objects.filter(species_id=species_id).select_related('species', 'location')

        # Get pin style
        try:
            pin_style = PinStyle.objects.get(is_default=True)
        except PinStyle.DoesNotExist:
            pin_style = None

        # Convert to GeoJSON format
        features = []
        for tree in trees:
            feature = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [tree.location.longitude, tree.location.latitude]
                },
                'properties': {
                    'id': str(tree.id),
                    'species_id': str(tree.species.id),
                    'common_name': tree.species.common_name,
                    'scientific_name': tree.species.scientific_name,
                    'family': tree.species.genus.family.name,
                    'genus': tree.species.genus.name,
                    'population': tree.population,
                    'health_status': tree.health_status,
                    'year': tree.year,
                    'location': tree.location.name,
                    'notes': tree.notes or ''
                }
            }
            features.append(feature)

        geojson = {
            'type': 'FeatureCollection',
            'features': features
        }

        # Add pin style to response
        if pin_style:
            geojson['pin_style'] = {
                'icon_class': pin_style.icon_class,
                'color': pin_style.color,
                'size': pin_style.size,
                'border_color': pin_style.border_color,
                'border_width': pin_style.border_width,
                'background_color': pin_style.background_color
            }

        return JsonResponse(geojson)
    except Exception as e:
        print(f"Error in filter_trees API: {str(e)}")
        return JsonResponse({
            'type': 'FeatureCollection',
            'features': [],
            'error': str(e)
        })


def analytics_data(request):
    """
    API endpoint for analytics data
    """
    # Species count
    species_count = list(TreeSpecies.objects.annotate(
        count=Count('trees')
    ).values('common_name', 'count').order_by('-count')[:10])

    # Population by year
    population_by_year = list(EndemicTree.objects.values('year').annotate(
        total=Sum('population')
    ).order_by('year'))

    # Population by family
    population_by_family = list(TreeFamily.objects.annotate(
        total=Sum('genera__species__trees__population')
    ).values('name', 'total').order_by('-total')[:10])

    # Health status distribution
    health_status_data = list(EndemicTree.objects.values('health_status').annotate(
        count=Count('id')
    ).order_by('health_status'))

    # Health status by year
    health_by_year_data = list(EndemicTree.objects.values('year', 'health_status').annotate(
        count=Count('id')
    ).order_by('year', 'health_status'))

    # Historical data analytics based on year
    # Get unique years
    years = EndemicTree.objects.values('year').distinct().order_by('year')
    year_list = [item['year'] for item in years]

    # Species richness by year
    species_richness_by_year = []
    for year in year_list:
        species_count = TreeSpecies.objects.filter(trees__year=year).distinct().count()
        species_richness_by_year.append({
            'year': year,
            'richness': species_count
        })

    # Growth rate calculation between years
    growth_rate_by_year = []
    for i in range(1, len(population_by_year)):
        current_year = population_by_year[i]
        prev_year = population_by_year[i - 1]

        if prev_year['total'] > 0:  # Avoid division by zero
            growth_rate = ((current_year['total'] - prev_year['total']) / prev_year['total']) * 100
        else:
            growth_rate = 0

        growth_rate_by_year.append({
            'year': current_year['year'],
            'growth_rate': round(growth_rate, 2)
        })

    # Environmental metrics (simulated data)
    # In a real app, these would be calculated from actual data
    conservation_status = [
        {'status': 'Least Concern', 'count': 48},
        {'status': 'Near Threatened', 'count': 23},
        {'status': 'Vulnerable', 'count': 15},
        {'status': 'Endangered', 'count': 7},
        {'status': 'Critically Endangered', 'count': 3},
    ]

    ecological_zones = [
        {'zone': 'Primary Forest', 'count': 45},
        {'zone': 'Secondary Forest', 'count': 27},
        {'zone': 'Riparian Zones', 'count': 15},
        {'zone': 'Forest Edge', 'count': 8},
        {'zone': 'Mountainous', 'count': 5},
    ]

    # Biodiversity indices (simulated data)
    biodiversity_indices = []
    for year in year_list:
        biodiversity_indices.append({
            'year': year,
            'shannon_index': round(3.0 + (year - min(year_list)) * 0.1, 2),  # Simulated data
            'simpson_index': round(0.8 + (year - min(year_list)) * 0.02, 2),  # Simulated data
        })

    data = {
        'species_count': species_count,
        'population_by_year': population_by_year,
        'population_by_family': population_by_family,
        'species_richness_by_year': species_richness_by_year,
        'growth_rate_by_year': growth_rate_by_year,
        'conservation_status': conservation_status,
        'ecological_zones': ecological_zones,
        'biodiversity_indices': biodiversity_indices,
        'health_status_data': health_status_data,
        'health_by_year_data': health_by_year_data
    }

    return JsonResponse(data)


@require_POST
def set_theme(request):
    """
    API endpoint to set theme
    """
    theme = request.POST.get('theme')
    if theme in ['dark', 'light', 'nature']:
        UserSetting.objects.update_or_create(
            key='theme',
            defaults={'value': theme}
        )
        return JsonResponse({'status': 'success', 'theme': theme})

    return JsonResponse({'status': 'error', 'message': 'Invalid theme'}, status=400)


@require_POST
def set_map_style(request):
    """
    API endpoint to set map style
    """
    style = request.POST.get('style')
    if style in ['dark', 'normal', 'light', 'satellite', 'topographic']:
        UserSetting.objects.update_or_create(
            key='map_style',
            defaults={'value': style}
        )
        return JsonResponse({'status': 'success', 'style': style})

    return JsonResponse({'status': 'error', 'message': 'Invalid map style'}, status=400)


@require_POST
def set_pin_style(request):
    """
    API endpoint to set default pin style
    """
    pin_style_id = request.POST.get('pin_style_id')
    try:
        pin_style = PinStyle.objects.get(id=pin_style_id)
        pin_style.is_default = True
        pin_style.save()
        return JsonResponse({'status': 'success', 'pin_style_id': pin_style_id})
    except PinStyle.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Pin style not found'}, status=404)


@require_POST
def save_setting(request):
    """
    API endpoint to save a single setting
    """
    key = request.POST.get('key')
    value = request.POST.get('value')

    if key and value is not None:
        UserSetting.objects.update_or_create(
            key=key,
            defaults={'value': value}
        )
        return JsonResponse({'status': 'success', 'key': key, 'value': value})

    return JsonResponse({'status': 'error', 'message': 'Invalid key or value'}, status=400)

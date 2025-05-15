from django.urls import path
from . import views

app_name = 'app'

urlpatterns = [
    path('', views.splash_screen, name='splash'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('gis/', views.gis, name='gis'),
    path('analytics/', views.analytics, name='analytics'),
    path('layers/', views.layers, name='layers'),
    path('datasets/', views.datasets, name='datasets'),
    path('upload/', views.upload_data, name='upload'),
    path('settings/', views.settings, name='settings'),
    path('about/', views.about, name='about'),
    path('reports/', views.reports, name='reports'),

    # Authentication URLs
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('register/', views.register, name='register'),

    # API endpoints
    path('api/tree-data/', views.tree_data, name='tree_data'),
    path('api/seed-data/', views.seed_data, name='seed_data'),
    path('api/filter-trees/<int:species_id>/', views.filter_trees, name='filter_trees'),
    path('api/analytics-data/', views.analytics_data, name='analytics_data'),
    path('api/set-theme/', views.set_theme, name='set_theme'),
    path('api/set-map-style/', views.set_map_style, name='set_map_style'),
    path('api/set-pin-style/', views.set_pin_style, name='set_pin_style'),
    path('api/save-setting/', views.save_setting, name='save_setting'),
]

from django import forms
from .models import EndemicTree, UserSetting, PinStyle, TreeSpecies, Location, TreeFamily, TreeGenus

class EndemicTreeForm(forms.Form):
    common_name = forms.CharField(max_length=100, required=True)
    scientific_name = forms.CharField(max_length=100, required=True)
    family = forms.ModelChoiceField(queryset=TreeFamily.objects.all(), required=True)
    genus = forms.ModelChoiceField(queryset=TreeGenus.objects.all(), required=True)
    population = forms.IntegerField(min_value=1, required=True)
    health_status = forms.ChoiceField(choices=[
        ('very_poor', 'Very Poor'),
        ('poor', 'Poor'),
        ('good', 'Good'),
        ('very_good', 'Very Good'),
        ('excellent', 'Excellent'),
    ], initial='good', required=True)
    latitude = forms.FloatField(required=True, widget=forms.NumberInput(attrs={'step': '0.000001'}))
    longitude = forms.FloatField(required=True, widget=forms.NumberInput(attrs={'step': '0.000001'}))
    year = forms.IntegerField(required=True)
    notes = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}), required=False)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add dynamic filtering for genus based on selected family
        if 'family' in self.data:
            try:
                family_id = int(self.data.get('family'))
                self.fields['genus'].queryset = TreeGenus.objects.filter(family_id=family_id)
            except (ValueError, TypeError):
                pass

class CSVUploadForm(forms.Form):
    csv_file = forms.FileField(
        label='Select a CSV file',
        help_text='File must be in CSV format with headers: common_name, scientific_name, family, genus, population, latitude, longitude, year, notes'
    )

class ThemeSettingsForm(forms.Form):
    THEME_CHOICES = [
        ('dark', 'Dark Theme'),
        ('light', 'Light Theme'),
        ('nature', 'Nature Theme'),
    ]
    
    MAP_STYLE_CHOICES = [
        ('dark', 'Dark Map'),
        ('normal', 'Normal Map'),
        ('light', 'Light Map'),
        ('satellite', 'Satellite'),
        ('topographic', 'Topographic'),
    ]
    
    theme = forms.ChoiceField(choices=THEME_CHOICES, widget=forms.RadioSelect, initial='dark')
    map_style = forms.ChoiceField(choices=MAP_STYLE_CHOICES, widget=forms.RadioSelect, initial='dark')
    pin_style = forms.ModelChoiceField(queryset=PinStyle.objects.all(), empty_label=None)
    enable_animations = forms.BooleanField(required=False, initial=True)
    high_contrast = forms.BooleanField(required=False, initial=False)
    font_size = forms.IntegerField(min_value=80, max_value=120, initial=100)
    default_zoom = forms.IntegerField(min_value=5, max_value=15, initial=9)
    show_scientific_names = forms.BooleanField(required=False, initial=True)

class PinStyleForm(forms.ModelForm):
    class Meta:
        model = PinStyle
        fields = ['name', 'icon_class', 'color', 'size', 'border_color', 
                  'border_width', 'background_color', 'is_default']
        widgets = {
            'color': forms.TextInput(attrs={'type': 'color'}),
            'border_color': forms.TextInput(attrs={'type': 'color'}),
            'background_color': forms.TextInput(attrs={'type': 'color'}),
        }

class LocationForm(forms.ModelForm):
    class Meta:
        model = Location
        fields = ['name', 'latitude', 'longitude', 'elevation', 'description']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }

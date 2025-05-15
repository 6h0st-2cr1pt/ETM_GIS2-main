from django.db import models
from django.utils import timezone
import uuid


class TreeFamily(models.Model):
    """Tree family classification"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Tree Families"


class TreeGenus(models.Model):
    """Tree genus classification"""
    name = models.CharField(max_length=100, unique=True)
    family = models.ForeignKey(TreeFamily, on_delete=models.CASCADE, related_name='genera')
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Tree Genera"


class TreeSpecies(models.Model):
    """Tree species classification"""
    scientific_name = models.CharField(max_length=100, unique=True)
    common_name = models.CharField(max_length=100)
    genus = models.ForeignKey(TreeGenus, on_delete=models.CASCADE, related_name='species')
    description = models.TextField(blank=True, null=True)
    is_endemic = models.BooleanField(default=True)
    conservation_status = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.common_name} ({self.scientific_name})"

    class Meta:
        verbose_name_plural = "Tree Species"


class Location(models.Model):
    """Geographic location"""
    name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    elevation = models.FloatField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.latitude}, {self.longitude})"


class PinStyle(models.Model):
    """Custom pin styles for map markers"""
    name = models.CharField(max_length=50)
    icon_class = models.CharField(max_length=50, default="fa-tree")
    color = models.CharField(max_length=20, default="#4caf50")
    size = models.IntegerField(default=24)
    border_color = models.CharField(max_length=20, default="#ffffff")
    border_width = models.IntegerField(default=2)
    background_color = models.CharField(max_length=20, default="rgba(0, 0, 0, 0.6)")
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one default style
        if self.is_default:
            PinStyle.objects.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class EndemicTree(models.Model):
    """Endemic tree records with yearly population data"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    species = models.ForeignKey(TreeSpecies, on_delete=models.CASCADE, related_name='trees')
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='trees')
    population = models.IntegerField()
    year = models.IntegerField(default=timezone.now().year)
    health_status = models.CharField(max_length=20, choices=[
        ('very_poor', 'Very Poor'),
        ('poor', 'Poor'),
        ('good', 'Good'),
        ('very_good', 'Very Good'),
        ('excellent', 'Excellent'),
    ], default='good')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.species.common_name} at {self.location.name} ({self.year})"

    class Meta:
        ordering = ['species__common_name', '-year']
        indexes = [
            models.Index(fields=['year']),
        ]
        unique_together = ['species', 'location', 'year']


class TreeSeed(models.Model):
    """Newly planted tree seeds/seedlings records"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    species = models.ForeignKey(TreeSpecies, on_delete=models.CASCADE, related_name='seeds')
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='seeds')
    quantity = models.IntegerField(help_text="Number of seeds planted")
    planting_date = models.DateField(default=timezone.now)
    germination_status = models.CharField(max_length=20, choices=[
        ('not_germinated', 'Not Germinated'),
        ('germinating', 'Germinating'),
        ('partially_germinated', 'Partially Germinated'),
        ('fully_germinated', 'Fully Germinated'),
        ('failed', 'Failed to Germinate'),
    ], default='not_germinated')
    germination_date = models.DateField(null=True, blank=True, help_text="Date when germination was first observed")
    survival_rate = models.FloatField(null=True, blank=True, help_text="Percentage of seeds that survived (0-100)")
    expected_maturity_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.species.common_name} seeds at {self.location.name} ({self.planting_date})"

    class Meta:
        ordering = ['-planting_date']
        indexes = [
            models.Index(fields=['planting_date']),
        ]


class MapLayer(models.Model):
    """Map layers for GIS visualization"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    url = models.URLField()
    layer_type = models.CharField(max_length=50, choices=[
        ('topographic', 'Topographic'),
        ('satellite', 'Satellite'),
        ('street', 'Street View'),
        ('heatmap', 'Heatmap'),
        ('protected', 'Protected Areas'),
        ('landuse', 'Land Use'),
        ('soil', 'Soil Type'),
        ('custom', 'Custom'),
    ])
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    attribution = models.CharField(max_length=255, blank=True, null=True)
    z_index = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one default per layer type
        if self.is_default:
            MapLayer.objects.filter(layer_type=self.layer_type, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)


class UserSetting(models.Model):
    """User application settings"""
    key = models.CharField(max_length=50, unique=True)
    value = models.TextField()

    def __str__(self):
        return self.key

# Generated by Django 5.2 on 2025-04-24 04:54

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MapLayer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
                ('url', models.URLField()),
                ('layer_type', models.CharField(choices=[('topographic', 'Topographic'), ('heatmap', 'Heatmap'), ('protected', 'Protected Areas'), ('landuse', 'Land Use'), ('soil', 'Soil Type'), ('custom', 'Custom')], max_length=50)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='UserSetting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.CharField(max_length=50, unique=True)),
                ('value', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='EndemicTree',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('common_name', models.CharField(max_length=100)),
                ('scientific_name', models.CharField(max_length=100)),
                ('species', models.CharField(max_length=100)),
                ('family', models.CharField(max_length=100)),
                ('genus', models.CharField(max_length=100)),
                ('population', models.IntegerField()),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('year', models.IntegerField(default=2025)),
            ],
            options={
                'ordering': ['common_name', '-year'],
                'indexes': [models.Index(fields=['common_name'], name='app_endemic_common__da638a_idx'), models.Index(fields=['scientific_name'], name='app_endemic_scienti_1ca41d_idx'), models.Index(fields=['year'], name='app_endemic_year_bb4abf_idx')],
            },
        ),
    ]

# Generated by Django 5.2 on 2025-04-24 08:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('elevation', models.FloatField(blank=True, null=True)),
                ('description', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='PinStyle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50)),
                ('icon_class', models.CharField(default='fa-tree', max_length=50)),
                ('color', models.CharField(default='#4caf50', max_length=20)),
                ('size', models.IntegerField(default=24)),
                ('border_color', models.CharField(default='#ffffff', max_length=20)),
                ('border_width', models.IntegerField(default=2)),
                ('background_color', models.CharField(default='rgba(0, 0, 0, 0.6)', max_length=20)),
                ('is_default', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='TreeFamily',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
            ],
            options={
                'verbose_name_plural': 'Tree Families',
            },
        ),
        migrations.CreateModel(
            name='TreeGenus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
            ],
            options={
                'verbose_name_plural': 'Tree Genera',
            },
        ),
        migrations.CreateModel(
            name='TreeSpecies',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scientific_name', models.CharField(max_length=100, unique=True)),
                ('common_name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
                ('is_endemic', models.BooleanField(default=True)),
                ('conservation_status', models.CharField(blank=True, max_length=50, null=True)),
            ],
            options={
                'verbose_name_plural': 'Tree Species',
            },
        ),
        migrations.AlterModelOptions(
            name='endemictree',
            options={'ordering': ['species__common_name', '-year']},
        ),
        migrations.RemoveIndex(
            model_name='endemictree',
            name='app_endemic_common__da638a_idx',
        ),
        migrations.RemoveIndex(
            model_name='endemictree',
            name='app_endemic_scienti_1ca41d_idx',
        ),
        migrations.AddField(
            model_name='endemictree',
            name='notes',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='maplayer',
            name='attribution',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='maplayer',
            name='is_default',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='maplayer',
            name='z_index',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='maplayer',
            name='layer_type',
            field=models.CharField(choices=[('topographic', 'Topographic'), ('satellite', 'Satellite'), ('street', 'Street View'), ('heatmap', 'Heatmap'), ('protected', 'Protected Areas'), ('landuse', 'Land Use'), ('soil', 'Soil Type'), ('custom', 'Custom')], max_length=50),
        ),
        migrations.AddField(
            model_name='endemictree',
            name='location',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='trees', to='app.location'),
        ),
        migrations.AddField(
            model_name='treegenus',
            name='family',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='genera', to='app.treefamily'),
        ),
        migrations.AddField(
            model_name='treespecies',
            name='genus',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='species', to='app.treegenus'),
        ),
        migrations.AlterField(
            model_name='endemictree',
            name='species',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trees', to='app.treespecies'),
        ),
        migrations.AlterUniqueTogether(
            name='endemictree',
            unique_together={('species', 'location', 'year')},
        ),
        migrations.RemoveField(
            model_name='endemictree',
            name='common_name',
        ),
        migrations.RemoveField(
            model_name='endemictree',
            name='family',
        ),
        migrations.RemoveField(
            model_name='endemictree',
            name='genus',
        ),
        migrations.RemoveField(
            model_name='endemictree',
            name='latitude',
        ),
        migrations.RemoveField(
            model_name='endemictree',
            name='longitude',
        ),
        migrations.RemoveField(
            model_name='endemictree',
            name='scientific_name',
        ),
    ]

# Generated by Django 4.2.3 on 2024-01-09 17:58

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("cantusdata", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="chant",
            name="concordances",
        ),
        migrations.DeleteModel(
            name="Concordance",
        ),
    ]
# Generated by Django 5.1.3 on 2024-12-23 16:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('userAuth', '0002_alter_user_managers'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='username',
        ),
    ]

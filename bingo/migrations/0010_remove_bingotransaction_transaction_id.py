# Generated by Django 5.0.6 on 2025-01-20 15:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bingo', '0009_bingotransaction_submitted_cartella_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='bingotransaction',
            name='transaction_id',
        ),
    ]

# Generated by Django 5.0.6 on 2025-01-25 00:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bingo', '0015_bingotransaction_locked_cartella'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bingouser',
            name='branch',
            field=models.CharField(default='hagere_bingo', max_length=100),
        ),
    ]

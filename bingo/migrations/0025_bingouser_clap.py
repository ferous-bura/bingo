# Generated by Django 4.2.13 on 2025-05-02 02:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bingo', '0024_alter_bingotransaction_game_pattern'),
    ]

    operations = [
        migrations.AddField(
            model_name='bingouser',
            name='clap',
            field=models.BooleanField(default=False),
        ),
    ]

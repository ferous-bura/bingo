# Generated by Django 5.0.6 on 2025-01-20 22:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bingo', '0013_bingotransaction_transaction_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='bingotransaction',
            name='refunded',
            field=models.BooleanField(default=False),
        ),
    ]

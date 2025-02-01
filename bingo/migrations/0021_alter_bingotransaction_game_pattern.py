# Generated by Django 5.0.6 on 2025-02-01 19:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bingo', '0020_bingocard_bingouser_last_notification'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bingotransaction',
            name='game_pattern',
            field=models.CharField(choices=[('default', 'Default Pattern'), ('any_two', 'Any 2 Pattern'), ('any_three', 'Any 3 Pattern'), ('any_four', 'Any 4 Pattern'), ('full_house', 'ሙሉ ቤት'), ('one_line', '1 መስመር'), ('two_line', '2 መስመር'), ('three_line', '3 መስመር'), ('four_line', '4 መስመር'), ('corners', 'Corners Only'), ('any_vertical', 'የትኛውም 1 ወደ ታች'), ('any_horizontal', 'የትኛውም 1 ወደ ጎን'), ('any_diagonal', 'የትኛውም Diagonal'), ('any_2_vertical', 'የትኛውም 2 ወደ ታች'), ('any_2_horizontal', 'የትኛውም 2 ወደ ጎን'), ('any_2_diagonal', '2 Diagonal'), ('four_middle', '4 Single Middle'), ('inner_outer', '4 Inner, 4 Outer')], default='default', max_length=50),
        ),
    ]

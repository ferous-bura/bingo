import json
from django.core.management.base import BaseCommand
from bingo.models import BingoCard
from bingo.card_lists import ahadu_bingo, hagere_bingo, liyu_bingo
# python manage.py load_bingo_cards
class Command(BaseCommand):
    help = "Load Bingo cards into the database"

    def handle(self, *args, **kwargs):

        # Save each Bingo card set to the database
        BingoCard.objects.update_or_create(
            name="hagere_bingo",
            defaults={"cards": hagere_bingo}
        )
        BingoCard.objects.update_or_create(
            name="ahadu_bingo",
            defaults={"cards": ahadu_bingo}
        )
        BingoCard.objects.update_or_create(
            name="liyu_bingo",
            defaults={"cards": liyu_bingo}
        )

        self.stdout.write(self.style.SUCCESS("Bingo cards saved successfully!"))
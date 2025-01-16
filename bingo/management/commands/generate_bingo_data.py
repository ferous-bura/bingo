import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from faker import Faker
from bingo.models import BingoDailyRecord, BingoTransaction, BingoUser
from django.utils.timezone import now

# python manage.py generate_bingo_data --days=7 --transactions=50

class Command(BaseCommand):
    help = "Generate bulk bingo data using Faker"

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=1,
            help='Number of days for which to generate data.'
        )
        parser.add_argument(
            '--transactions',
            type=int,
            default=10,
            help='Number of transactions per day.'
        )

    def handle(self, *args, **kwargs):
        fake = Faker()
        days = kwargs['days']
        transactions_per_day = kwargs['transactions']

        # Ensure there are BingoUsers to associate with the records
        users = BingoUser.objects.all()
        if not users.exists():
            self.stdout.write(self.style.ERROR('No BingoUser instances found. Create some users first.'))
            return

        for _ in range(days):
            for user in random.sample(list(users), min(len(users), transactions_per_day)):
                # Create a daily record for the user
                daily_record = BingoDailyRecord.objects.create(
                    user=user,
                    date=fake.date_this_year(),
                    total_winning=Decimal(0),
                    total_cut=Decimal(0),
                    total_transactions=0,
                )

                for _ in range(transactions_per_day):
                    bet = Decimal(random.choice([10, 20, 50, 100]))
                    total_won = bet * Decimal(random.uniform(1.5, 5.0))
                    cut_percentage = Decimal(user.cut_percentage) / Decimal(100)
                    cut = total_won * cut_percentage
                    won = total_won - cut
                    call_number = random.randint(1, 75)
                    winners = random.randint(1, 100)

                    # Create the BingoTransaction
                    BingoTransaction.objects.create(
                        daily_record=daily_record,
                        time=fake.time(),
                        game_type=random.choice(['Regular', 'Speed', 'Jackpot']),
                        bet=bet,
                        player_number=random.randint(1, 100),
                        total_won=total_won,
                        cut=cut,
                        won=won,
                        call_number=call_number,
                        winners=winners,
                        started=True,
                        ended=True,
                        result=[call_number],
                    )

                    # Update daily record stats
                    daily_record.total_transactions += 1
                    daily_record.total_winning += total_won
                    daily_record.total_cut += cut

                    # Adjust user balance
                    user.balance -= bet
                    user.credit += won
                    user.save()

                daily_record.save()

        self.stdout.write(self.style.SUCCESS('Successfully generated bingo data.'))

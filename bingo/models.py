from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User

from bingo.pattern_choice import GAME_PATTERN_CHOICES

class BingoUser(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=1000)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    branch = models.CharField(max_length=100, default="hagere_bingo")
    cut_percentage = models.PositiveIntegerField(default=25)

class BingoDailyRecord(models.Model):
    user = models.ForeignKey(BingoUser, on_delete=models.CASCADE, related_name="bingo_record")
    date = models.DateField(default=now)
    total_winning = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_cut = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_transactions = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.owner.username} - {self.date} - ${self.user.balance}"


class BingoTransaction(models.Model):
    daily_record = models.ForeignKey(
        BingoDailyRecord, related_name="transactions", on_delete=models.CASCADE
    )
    result = models.JSONField(default=list)

    time = models.TimeField(default=now)
    GAME_PATTERNS = [
        ('full_house', 'Full House'),  # All numbers must be marked
        ('two_line', 'Two Lines'),    # Any two lines must be completed
        ('one_line', 'One Line'),     # Any single line must be completed
        ('corners', 'Four Corners'),  # Only the four corners must be completed
    ]
    game_pattern = models.CharField(
        max_length=50,
        choices=GAME_PATTERN_CHOICES,
        default="default",)
    game_type = models.CharField(max_length=100)
    bet = models.DecimalField(max_digits=10, decimal_places=2)
    player_number = models.PositiveIntegerField()
    total_won = models.DecimalField(max_digits=10, decimal_places=2)
    cut = models.DecimalField(max_digits=10, decimal_places=2)
    won = models.DecimalField(max_digits=10, decimal_places=2)
    call_number = models.PositiveIntegerField()
    winners = models.CharField(max_length=50, blank=True, default='')
    submitted_cartella = models.CharField(max_length=255, blank=True, default='')
    locked_cartella = models.CharField(max_length=255, blank=True, default='')
    started = models.BooleanField(default=False)
    ended = models.BooleanField(default=False)
    refunded = models.BooleanField(default=False)
    transaction_id = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['daily_record__date']

    def __str__(self):
        return f"Bet: {self.bet}, Player#: {self.player_number}, Total Won: {self.total_won}"

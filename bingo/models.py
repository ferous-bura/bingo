from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User

from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver

from bingo.pattern_choice import GAME_PATTERN_CHOICES

class BingoUser(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=1000)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    branch = models.CharField(max_length=100, default="hagere_bingo")
    cut_percentage = models.PositiveIntegerField(default=25)
    last_notification = models.DateTimeField(null=True, blank=True)
    show_balance = models.BooleanField(default=True)

    def __str__(self):
        return self.owner.username

class Notification(models.Model):
    user = models.ForeignKey(BingoUser, on_delete=models.CASCADE, related_name="notifications")
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

class BingoDailyRecord(models.Model):
    user = models.ForeignKey(BingoUser, on_delete=models.CASCADE, related_name="bingo_record")
    date = models.DateField(default=now)
    total_winning = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_cut = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_transactions = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.owner.username}"


class BingoTransaction(models.Model):
    daily_record = models.ForeignKey(
        BingoDailyRecord, related_name="transactions", on_delete=models.CASCADE
    )
    result = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    time = models.TimeField(default=now)
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
        ordering = ['created_at']

    def __str__(self):
        return f"Bet: {self.bet}, Player#: {self.player_number}, Total Won: {self.total_won}"


class BingoCard(models.Model):
    name = models.CharField(max_length=100, unique=True)  # e.g., "hagere_bingo", "ahadu_bingo"
    cards = models.JSONField()  # Store the list of cards as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

def add_daily_balance_and_notify(user: BingoUser):
    # Add daily balance
    balance = 200
    user.balance += balance
    user.save()

    # Create a notification message
    message = f"Dear {user.owner.username}, your daily balance of {balance} has been added. Your new balance is {user.balance:.2f}."

    # Save the notification (if you have a Notification model)
    Notification.objects.create(user=user, message=message)

    # Simulate sending the notification (print for now, replace with actual sending logic)
    print(f"Notification sent to {user.owner.username}: {message}")

    return message

@receiver(user_logged_in)
def handle_daily_login(sender, request, user, **kwargs):
    try:
        bingo_user = BingoUser.objects.get(owner=user)

        # Check if the user already received their daily balance today
        if bingo_user.last_notification and bingo_user.last_notification.date() == now().date():
            print(f"User {user.username} has already received today's balance.")
            return

        # Add balance and update the last_notification timestamp
        add_daily_balance_and_notify(bingo_user)
        bingo_user.last_notification = now()
        bingo_user.save()

    except BingoUser.DoesNotExist:
        print(f"No BingoUser profile found for {user.username}.")

# @receiver(user_logged_in)
# def handle_daily_login(sender, request, user, **kwargs):
#     try:
#         bingo_user = BingoUser.objects.get(owner=user)

#         # Check if the user already received their daily balance today
#         last_notification = bingo_user.notifications.last()
#         if last_notification and last_notification.created_at.date() == datetime.now().date():
#             print(f"User {user.username} has already received today's balance.")
#             return

#         # Add balance and send notification
#         add_daily_balance_and_notify(bingo_user)

#     except BingoUser.DoesNotExist:
#         print(f"No BingoUser profile found for {user.username}.")

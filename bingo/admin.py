from django.contrib import admin
from .models import BingoDailyRecord, BingoTransaction, BingoUser, Notification, BingoCard

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "message", "created_at", "is_read")

@admin.register(BingoUser)
class BingoUserAdmin(admin.ModelAdmin):
    list_display = ("owner", "balance", "credit", "branch", "cut_percentage")

@admin.register(BingoDailyRecord)
class BingoDailyRecordAdmin(admin.ModelAdmin):
    list_display = ("date", "total_winning", "total_cut", "total_transactions")

@admin.register(BingoTransaction)
class BingoTransactionAdmin(admin.ModelAdmin):
    list_display = ("created_at", "time", "bet", "player_number", "total_won", "cut", "won","game_type", "winners", "submitted_cartella", "started", "ended")

@admin.register(BingoCard)
class BingoCardAdmin(admin.ModelAdmin):
    list_display = ("created_at", "name", "cards", "updated_at")

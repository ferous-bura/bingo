from django.contrib import admin
from .models import BingoDailyRecord, BingoTransaction, BingoUser

@admin.register(BingoUser)
class BingoUserAdmin(admin.ModelAdmin):
    list_display = ("owner", "balance", "credit", "branch", "cut_percentage")

@admin.register(BingoDailyRecord)
class BingoDailyRecordAdmin(admin.ModelAdmin):
    list_display = ("date", "total_winning", "total_cut", "total_transactions")

@admin.register(BingoTransaction)
class BingoTransactionAdmin(admin.ModelAdmin):
    list_display = ("time", "bet", "player_number", "total_won", "cut", "won","game_type")

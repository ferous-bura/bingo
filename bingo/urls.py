from django.urls import path
from .views.bingo import main, mark_notification_as_read
from .views.start import start_bingo
from .views.auth import CustomPasswordChangeView, logout_view, login_view
from .views.report import fetch_reports
from .views.check_winner import check_winner, lock
from .views.manage_bingo import refund_bingo, close_game

urlpatterns = [
    path('', main, name='bingo'),
    path("reports/", fetch_reports, name="fetch_reports"),
    path('logout/', logout_view, name='logout'),
    path("login/", login_view, name="login"),
    path("start-bingo/", start_bingo, name="start"),
    path("check-bingo-winner/", check_winner, name="check"),
    path("close-bingo/", close_game, name="close"),
    path("refund-bingo/", refund_bingo, name="refund"),
    path('change-password/', CustomPasswordChangeView.as_view(), name='change_password'),
    path("lock/", lock, name="lock"),
    path('mark-notification-as-read/<int:notification_id>/', mark_notification_as_read, name='mark_notification_as_read'),
]
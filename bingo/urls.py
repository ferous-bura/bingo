from django.urls import path
from .views import main, logout_view, login_view, fetch_reports, start_bingo, check_winner, close_game

urlpatterns = [
    path('', main, name='bingo'),
    path("reports/", fetch_reports, name="fetch_reports"),
    path('logout/', logout_view, name='logout'),
    path("login/", login_view, name="login"),
    path("start-bingo/", start_bingo, name="start"),
    path("check-bingo-winner/", check_winner, name="check"),
    path("close_bingo/", close_game, name="close"),

]
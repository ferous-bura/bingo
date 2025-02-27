from django.urls import path
from core.views import main, download_game

urlpatterns = [
    path('', main, name='core'),
    path('game', download_game, name='download_game'),
]
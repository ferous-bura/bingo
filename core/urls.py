from django.urls import path
from core.views import main

urlpatterns = [
    path('', main, name='core'),
]
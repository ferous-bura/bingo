from django.urls import path

from offline_app.location import save_location, check_location
from offline_app.views import index, request_update_balance


urlpatterns = [
    path('', index, name="offline_index"),
    path('save-location/', save_location, name="location"),
    path('check-location/', check_location, name="check_location"),
    path("request-update-balance/", request_update_balance, name="request_update_balance"),
]

from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', include('bingo.urls')),
    path('core/', include('core.urls')),
    path('admin/', admin.site.urls),
]
# urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if not settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# if settings.DEBUG:
#     import debug_toolbar
#     urlpatterns = [
#         path('__debug__/', include(debug_toolbar.urls)),
#     ] + urlpatterns

# cp db.sqlite3 db.sqlite3.backup
# git reset --hard origin/main
# mv db.sqlite3.backup db.sqlite3

# source ~/.virtualenvs/<env_name>/bin/activate

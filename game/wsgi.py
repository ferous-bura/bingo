"""
WSGI config for game project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os
import sys

# Path to your project
#path = '/home/lotterybingo/bingo'
#if path not in sys.path:
#    sys.path.append(path)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game.settings')

application = get_wsgi_application()
app = get_wsgi_application()

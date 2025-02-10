import os
import sys

# Path to your project
path = '/home/lotterybingo/bingo'
if path not in sys.path:
    sys.path.append(path)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'game.settings')

application = get_wsgi_application()
app = get_wsgi_application()

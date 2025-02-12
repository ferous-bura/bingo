# -*- mode: python ; coding: utf-8 -*-

# offline_run.spec
from PyInstaller.utils import misc
block_cipher = None

a = Analysis(
    ['django_server.py'],
    pathex=['C:/Users/bura/Desktop/cartella-cards/prj/New folder/bingo'],
    binaries=[],
    datas=[
        ('C:/Users/bura/Desktop/cartella-cards/prj/New folder/bingo/game/settings.py', 'game'),
        ('C:/Users/bura/Desktop/cartella-cards/prj/New folder/bingo/bingo', 'bingo'),
        ('C:/Users/bura/Desktop/cartella-cards/prj/New folder/bingo/core', 'core'),
        ('C:/Users/bura/Desktop/cartella-cards/prj/New folder/bingo/offline_app', 'offline_app'),
        ('C:/Users/bura/Desktop/cartella-cards/prj/New folder/bingo/staticfiles', 'static'),  # Include static files
    ],
    hiddenimports=[
        # Django-specific modules
        'django.db.models',
        'django.core.management',
        'django.core.handlers.wsgi',
        'django.core.handlers.base',
        'django.utils.dateparse',
        'django.contrib.staticfiles',
        'django.forms', 
        'django.urls', 
        'django.utils',
        'django-environ', 
        'djangorestframework', 
        'django_timezone_field',
        'Faker', 
        'prompt_toolkit', 
        'dateutil', 
        'pytz', 
        'requests', 
        'gunicorn', 
        'PIL',  # If you're using images
        'colorama',  # Required for Django management commands
        'whitenoise',  # For static files
        'gunicorn',  # If used in production
        
        # Add other missing modules from your list here
        'asgiref',
        'sqlparse',
        'pytz',
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[
        # Exclude platform-specific modules (e.g., Unix-only)
        'pwd', 'grp', 'termios', 'resource', 'posix', 
        # Exclude unused DB drivers (if not needed)
        'psycopg2', 'cx_Oracle', 'MySQLdb', 'oracledb',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    console=True
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [('v', None, 'OPTION')],
    name='offline_run',
    debug=True,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='offline_run',
)
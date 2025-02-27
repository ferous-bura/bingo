from django.shortcuts import render, HttpResponse
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
file_path = BASE_DIR / 'setup-keno.zip'


def main(request):
    return HttpResponse('core main view reached')


def download_game(request):
    # Path to your ZIP file

    # Open the file in binary mode
    with open(file_path, 'rb') as file:
        response = HttpResponse(file.read(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
        return response
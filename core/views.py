from django.shortcuts import render, HttpResponse

# Create your views here.

def main(request):
    return HttpResponse('core main view reached')

from django.shortcuts import render

def home(request):
    return render(request, 'linkoncity_app/home.html')
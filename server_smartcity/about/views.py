from django.shortcuts import render

def about(request):
    return render(request, 'linkoncity_app/about.html')
from django.shortcuts import render

def contacts(request):
    return render(request, 'linkoncity_app/contacts.html')
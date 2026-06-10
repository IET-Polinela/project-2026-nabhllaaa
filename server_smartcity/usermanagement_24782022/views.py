from django.shortcuts import render, redirect
from .forms import RegisterForm
from django.contrib import messages

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_admin = False  # 🔥 penting
            user.save()

            messages.success(request, "Registrasi berhasil! Silakan login.")
            return redirect('login')
    else:
        form = RegisterForm()

    return render(request, 'register.html', {'form': form})
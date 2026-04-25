from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'is_admin', 'is_member', 'is_staff')

admin.site.register(CustomUser, CustomUserAdmin)
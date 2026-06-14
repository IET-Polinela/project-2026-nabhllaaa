from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        is_admin = bool(
            getattr(user, 'is_admin', False) or
            getattr(user, 'is_staff', False) or
            getattr(user, 'is_superuser', False)
        )

        token['username'] = user.username
        token['is_admin'] = is_admin
        token['is_staff'] = bool(getattr(user, 'is_staff', False))
        token['is_superuser'] = bool(getattr(user, 'is_superuser', False))
        token['role'] = 'admin' if is_admin else 'citizen'

        return token

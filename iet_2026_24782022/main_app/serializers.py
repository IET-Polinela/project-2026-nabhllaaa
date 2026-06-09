from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    reporter = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = ['id', 'title', 'category', 'description', 'location', 'reporter', 'status', 'created_at', 'updated_at', 'is_owner']

    def get_reporter(self, obj):
        if obj.reporter and getattr(obj.reporter, 'username', None):
            return obj.reporter.username
        return "Warga Anonim"

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.reporter == request.user
        return False
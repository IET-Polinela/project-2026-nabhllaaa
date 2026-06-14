from rest_framework import serializers
from .models import Report

def normalize_report_status(value):
    normalized = str(value or '').strip().upper().replace('-', '_').replace(' ', '_')
    compact = normalized.replace('_', '')
    aliases = {
        'DRAF': 'DRAFT',
        'DRAFT': 'DRAFT',
        'REPORT': 'REPORTED',
        'REPORTED': 'REPORTED',
        'SUBMITTED': 'REPORTED',
        'TERKIRIM': 'REPORTED',
        'VERIFIED': 'VERIFIED',
        'VERIFIKASI': 'VERIFIED',
        'REVIEW': 'VERIFIED',
        'INPROGRESS': 'IN_PROGRESS',
        'IN_PROGRESS': 'IN_PROGRESS',
        'DIPROSES': 'IN_PROGRESS',
        'PROSES': 'IN_PROGRESS',
        'PROGRESS': 'IN_PROGRESS',
        'PROCESSING': 'IN_PROGRESS',
        'RESOLVED': 'RESOLVED',
        'SELESAI': 'RESOLVED',
        'COMPLETED': 'RESOLVED',
        'DONE': 'RESOLVED',
        'FINISH': 'RESOLVED',
    }
    return aliases.get(normalized) or aliases.get(compact) or normalized


class ReportSerializer(serializers.ModelSerializer):
    reporter = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = ['id', 'title', 'category', 'description', 'location', 'reporter', 'status', 'created_at', 'updated_at', 'is_owner']

    def to_internal_value(self, data):
        mutable_data = data.copy()
        field_aliases = {
            'judul': 'title',
            'kategori': 'category',
            'deskripsi': 'description',
            'lokasi': 'location',
        }

        for mobile_field, api_field in field_aliases.items():
            if mobile_field in mutable_data and api_field not in mutable_data:
                mutable_data[api_field] = mutable_data[mobile_field]

        if 'status' in mutable_data:
            mutable_data['status'] = normalize_report_status(mutable_data['status'])

        return super().to_internal_value(mutable_data)

    def get_reporter(self, obj):
        if obj.reporter and getattr(obj.reporter, 'username', None):
            return obj.reporter.username
        return "Warga Anonim"

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.reporter == request.user
        return False

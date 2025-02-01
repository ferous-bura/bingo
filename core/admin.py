# admin.py
from django.contrib import admin
from core.models import BlockedDevice, BlockedIP

@admin.register(BlockedDevice)
class BlockedDeviceAdmin(admin.ModelAdmin):
    list_display = ('device_id', 'ip_address', 'user_agent', 'blocked_until', 'is_blocked')
    list_editable = ('is_blocked',)  # Allow editing the is_blocked field
    search_fields = ('device_id', 'ip_address')
    actions = ['unblock_devices']

    def unblock_devices(self, request, queryset):
        queryset.update(is_blocked=False, blocked_until=None)
    unblock_devices.short_description = "Unblock selected devices"

@admin.register(BlockedIP)
class BlockedIPAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'blocked_until', 'is_blocked')
    list_editable = ('is_blocked',)  # Allow editing the is_blocked field
    actions = ['unblock_ips']

    def unblock_ips(self, request, queryset):
        queryset.update(is_blocked=False, blocked_until=None)
    unblock_ips.short_description = "Unblock selected IPs"

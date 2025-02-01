# management/commands/unblock.py
from django.core.management.base import BaseCommand
from core.models import BlockedDevice, BlockedIP
"""
python manage.py unblock --device test_device_id
python manage.py unblock --ip 127.0.0.1
"""
class Command(BaseCommand):
    help = 'Unblock devices or IPs'

    def add_arguments(self, parser):
        parser.add_argument('--device', type=str, help='Device ID to unblock')
        parser.add_argument('--ip', type=str, help='IP address to unblock')

    def handle(self, *args, **kwargs):
        device_id = kwargs.get('device')
        ip_address = kwargs.get('ip')

        if device_id:
            BlockedDevice.objects.filter(device_id=device_id).update(is_blocked=False, blocked_until=None)
            self.stdout.write(self.style.SUCCESS(f"Unblocked device {device_id}"))

        if ip_address:
            BlockedIP.objects.filter(ip_address=ip_address).update(is_blocked=False, blocked_until=None)
            self.stdout.write(self.style.SUCCESS(f"Unblocked IP {ip_address}"))
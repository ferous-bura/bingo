from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseForbidden
from django.core.cache import cache
from django.utils import timezone
import uuid
import logging

from .models import BlockedDevice, BlockedIP

# logger = logging.get# logger(__name__)

class DeviceInfoMiddleware(MiddlewareMixin):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.process_request(request)
        if response:
            return response  # Return forbidden response if any blocking logic applies
        return self.get_response(request)

    def process_request(self, request):
        # Get the User-Agent header
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # List of known browser User-Agent strings
        browser_user_agents = [
            'Mozilla',  # Firefox, Chrome, Safari, Edge, etc.
            'AppleWebKit',  # Safari, Chrome, etc.
            'Chrome',
            'Safari',
            'Edge',
            'Firefox',
            'Opera',
            'Trident',  # Internet Explorer
        ]

        # Check if the User-Agent is from a browser
        is_browser = any(agent in user_agent for agent in browser_user_agents)

        # Block non-browser requests
        if not is_browser:
            # logger.warning(f"Non-browser request blocked. User-Agent: {user_agent}")
            return HttpResponseForbidden("Access denied. Only browser requests are allowed.")

        # Get device and IP details
        ip_address = request.META.get('REMOTE_ADDR', '')
        device_id = request.META.get('HTTP_X_DEVICE_ID', str(uuid.uuid4()))

        request.device_info = {
            'user_agent': user_agent,
            'ip_address': ip_address,
            'device_id': device_id,
        }

        # logger.info(f"Device ID: {device_id}, IP: {ip_address}, User Agent: {user_agent}")

        # Check if the IP is blocked
        if self.is_ip_blocked(ip_address):
            # logger.warning(f"Blocked IP attempted access: {ip_address}")
            return HttpResponseForbidden("Access denied. Your IP is blocked.")

        # Check if the device is blocked
        if self.is_device_blocked(device_id):
            # logger.warning(f"Blocked device attempted access: {device_id}")
            return HttpResponseForbidden("Access denied. Your device is blocked.")

        # Rate limiting
        request_count = cache.get(f'request_count_{device_id}', 0)
        # logger.debug(f"Request count for device {device_id}: {request_count}")

        if request_count >= 240:
            self.block_device_and_ip(device_id, ip_address, user_agent)
            return HttpResponseForbidden("Too many requests. Your device and IP have been blocked.")

        cache.set(f'request_count_{device_id}', request_count + 1, timeout=60)
        # logger.debug(f"Incremented request count for device {device_id}: {request_count + 1}")

    def is_ip_blocked(self, ip_address):
        """ Check if the IP is blocked in the database """
        return BlockedIP.objects.filter(ip_address=ip_address, is_blocked=True, blocked_until__gte=timezone.now()).exists()

    def is_device_blocked(self, device_id):
        """ Check if the device is blocked in the database """
        return BlockedDevice.objects.filter(device_id=device_id, is_blocked=True, blocked_until__gte=timezone.now()).exists()

    # def is_request_allowed(self, device_id):
    #     """ Rate limiting logic: Max 10 requests per 60 seconds """
    #     request_count = cache.get(f'request_count_{device_id}', 0)
    #     if request_count >= 240:
    #         return False
    #     cache.set(f'request_count_{device_id}', request_count + 1, timeout=60)
    #     return True

    def block_device_and_ip(self, device_id, ip_address, user_agent):
        """ Block the device and IP for 1 hour """
        blocked_until = timezone.now() + timezone.timedelta(hours=1)

        # Block the device
        BlockedDevice.objects.update_or_create(
            device_id=device_id,
            defaults={'ip_address': ip_address, 'user_agent': user_agent, 'blocked_until': blocked_until, 'is_blocked': True}
        )

        # Block the IP
        BlockedIP.objects.update_or_create(
            ip_address=ip_address,
            defaults={'blocked_until': blocked_until, 'is_blocked': True}
        )

        # logger.warning(f"Blocked device and IP: Device ID: {device_id}, IP: {ip_address}")

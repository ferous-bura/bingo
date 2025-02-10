from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils.timezone import now
from bingo.models import BingoUser
from offline_app.models import OfflineUsers
# python manage.py create_bingo_user
class Command(BaseCommand):
    help = "Create a new user along with BingoUser and OfflineUsers"

    def handle(self, *args, **kwargs):
        # Get username
        username = input("Enter username: ")
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f"User '{username}' already exists."))
            return
        
        # Get password securely
        from getpass import getpass
        password = getpass("Enter password: ")
        confirm_password = getpass("Confirm password: ")
        if password != confirm_password:
            self.stdout.write(self.style.ERROR("Passwords do not match."))
            return

        # Get branch choice
        branch_choices = ["hagere_bingo", "addis_bingo", "mekele_bingo"]
        print("Available branches:", ", ".join(branch_choices))
        branch = input("Enter branch (default 'hagere_bingo'): ").strip()
        if branch not in branch_choices:
            self.stdout.write(self.style.WARNING(f"Invalid branch, defaulting to 'hagere_bingo'."))
            branch = "hagere_bingo"

        # Create User
        user = User.objects.create_user(username=username, password=password)
        
        # Create BingoUser
        bingo_user = BingoUser.objects.create(
            owner=user,
            balance=0,  # Default balance
            branch=branch
        )

        # Create OfflineUsers
        offline_user = OfflineUsers.objects.create(
            owner=user,
            balance=0,  # Default balance
            last_updated=now(),
            device_id=""
        )

        self.stdout.write(self.style.SUCCESS(f"User '{username}' created successfully with branch '{branch}'!"))

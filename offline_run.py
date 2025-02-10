import os
import sys
import django
import logging

# (Optional) Configure logging to save messages to a file
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    filename="offline_run.log",
    filemode="a"
)
console = logging.StreamHandler(sys.stdout)
console.setLevel(logging.DEBUG)
logging.getLogger('').addHandler(console)

# Adjust sys.path to include your project directory
sys.path.append(r"C:\Users\bura\Desktop\cartella-cards\prj\New folder\bingo")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "game.settings")

try:
    django.setup()
except Exception as e:
    logging.exception("Error during Django setup:")
    input("Press Enter to exit...")
    sys.exit(1)

from django.core.management import execute_from_command_line

if __name__ == "__main__":
    # When frozen, set sys.argv[0] to a dummy script path
    if getattr(sys, "frozen", False):
        # Ensure this points to a file that exists; you can create an empty file named manage.py
        dummy_script = os.path.join(os.path.dirname(sys.executable), "manage.py")
        # If the file does not exist, you might consider creating it or just assigning a valid name.
        if not os.path.exists(dummy_script):
            with open(dummy_script, "w") as f:
                f.write("# Dummy manage.py for autoreload\n")
        sys.argv[0] = dummy_script

    logging.info("Starting Django management command with args: %s", sys.argv)
    try:
        execute_from_command_line(sys.argv)
    except Exception as e:
        logging.exception("An error occurred during command execution:")
        input("Press Enter to exit...")
        sys.exit(1)

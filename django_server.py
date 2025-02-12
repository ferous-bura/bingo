import os
import sys
import subprocess
import tempfile
from tkinter import messagebox

def check_if_running():
    """Check if another instance is running using a temp file as lock"""
    lock_file = os.path.join(tempfile.gettempdir(), 'django_server_lock')
    
    if os.path.exists(lock_file):
        try:
            # Try to remove the file - if we can't, server is running
            os.remove(lock_file)
            with open(lock_file, 'w') as f:
                f.write('locked')
        except OSError:
            print("Error: Django server is already running")
            sys.exit(0)
    else:
        with open(lock_file, 'w') as f:
            f.write('locked')

def run_django_server():
    try:
        # Get the directory where the executable is located
        if getattr(sys, 'frozen', False):
            application_path = os.path.dirname(sys.executable)
        else:
            application_path = os.path.dirname(os.path.abspath(__file__))

        # Change to the directory containing manage.py
        os.chdir(application_path)

        # Start Django server
        subprocess.run([
            sys.executable,
            "manage.py",
            "runserver",
            "127.0.0.1:9000"
        ], check=True)

    except subprocess.CalledProcessError as e:
        messagebox.showerror("Error", f"Failed to start Django server: {str(e)}")
        sys.exit(1)
    except Exception as e:
        messagebox.showerror("Error", f"An error occurred: {str(e)}")
        sys.exit(1)
    finally:
        # Clean up lock file
        lock_file = os.path.join(tempfile.gettempdir(), 'django_server_lock')
        try:
            os.remove(lock_file)
        except:
            pass

if __name__ == "__main__":
    check_if_running()
    run_django_server()

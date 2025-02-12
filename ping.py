import requests
from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

@scheduler.scheduled_job('interval', minutes=4)
def trigger_pythonanywhere_task():
    url = "http://127.0.0.1:8000"
    r = requests.get(url)
    print(r.text)

scheduler.start()
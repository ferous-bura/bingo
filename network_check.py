import requests
username = 'lotterybingo'
token = 'fb9bb8d4b6dd36fdbc3da08c46b2c1db3383de6a'

response = requests.get(
    'https://www.pythonanywhere.com/api/v0/user/{username}/cpu/'
    # "https://www.pythonanywhere.com/api/v0/user/{username}/network_usage/"
    .format(
        username=username
    ),
    headers={'Authorization': 'Token {token}'.format(token=token)}
)
if response.status_code == 200:
    print('CPU quota info:')
    print(response.content)
    data = response.json()
    # print(f"Daily network usage: {data['total_bytes_used'] / (1024 * 1024):.2f} MB")
    # print(f"Daily limit: {data['daily_limit_bytes'] / (1024 * 1024):.2f} MB")
else:
    print('Got unexpected status code {}: {!r}'.format(response.status_code, response.content))


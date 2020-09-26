FROM python:3.6
# FROM tiangolo/uwsgi-nginx-flask:python3.6

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r ./requirements.txt
RUN pip install -U numpy

COPY . .

CMD [ "python", "-u", "server.py" ]
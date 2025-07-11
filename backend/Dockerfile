FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt -f https://download.pytorch.org/whl/torch_stable.html

COPY app.py .
COPY init_db.py .
COPY tasks.db .

EXPOSE 5000

CMD ["python", "app.py"]

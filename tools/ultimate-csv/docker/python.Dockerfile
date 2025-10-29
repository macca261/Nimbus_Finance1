FROM python:3.11-slim
WORKDIR /app/python
COPY python/pyproject.toml ./
RUN pip install --no-cache-dir uv
RUN uv pip install --system .
COPY python/ultimate_csv ./ultimate_csv
EXPOSE 3002
CMD ["python", "-m", "ultimate_csv.http"]



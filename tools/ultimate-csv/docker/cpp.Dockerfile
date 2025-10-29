FROM ubuntu:22.04
RUN apt-get update && apt-get install -y build-essential cmake && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY cpp ./cpp
RUN mkdir -p cpp/build && cd cpp/build && cmake .. && make -j
EXPOSE 3004
CMD ["/app/cpp/build/ultimatecsv"]



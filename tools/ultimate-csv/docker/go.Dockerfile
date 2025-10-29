FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go/go.mod ./go/
COPY go ./go
RUN cd go && go build ./cmd/ultimatecsv

FROM alpine:3.19
WORKDIR /app
COPY --from=build /app/go/ultimatecsv /usr/local/bin/ultimatecsv
EXPOSE 3003
CMD ["/usr/local/bin/ultimatecsv"]



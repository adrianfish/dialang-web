FROM golang:alpine3.22 as builder

WORKDIR /app

# pre-copy/cache go.mod for pre-downloading dependencies and only redownloading them in subsequent builds if they change
COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./
COPY handlers/ handlers/
COPY models/ models/
COPY utils/ utils/
COPY datacapture/ datacapture/
COPY data/ data/
COPY scoring/ scoring/
COPY session/ session/
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o dialang-web .

FROM scratch

WORKDIR /app

COPY data-files/ data-files/

COPY --from=builder /app/dialang-web .

ENV PORT=80

EXPOSE $PORT

CMD ["./dialang-web"]

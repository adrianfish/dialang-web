FROM golang:1.25

RUN mkdir /common
COPY common/ /common

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
COPY db/ db/
COPY scoring/ scoring/
COPY session/ session/
COPY data-files/ data-files/
RUN CGO_ENABLED=0 GOOS=linux go build -o dialang-web
RUN chmod o+x dialang-web

CMD ["/app/dialang-web"]

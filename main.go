package main

import (
	"net/http"
	"log"

	"github.com/dialangproject/web/handlers"
	"github.com/dialangproject/web/session"
)

func main()  {

	mux := http.NewServeMux()

	mux.HandleFunc("/setal", handlers.SetAL)
	mux.HandleFunc("/settl", handlers.SetTL)
	mux.HandleFunc("/scorevspt", handlers.ScoreVSPT)
	mux.HandleFunc("/scoresa", handlers.ScoreSA)
	mux.HandleFunc("/starttest", handlers.StartTest)
	mux.HandleFunc("/submitbasket", handlers.SubmitBasket)

	log.Fatal(http.ListenAndServe(":80", session.SessionManager.LoadAndSave(mux)))
}

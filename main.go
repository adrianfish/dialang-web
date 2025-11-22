package main

import (
	"log"
	"net/http"
	"os"

	"github.com/adrianfish/dialang-web/handlers"
	"github.com/adrianfish/dialang-web/session"
)

func main() {

	mux := http.NewServeMux()

	mux.HandleFunc("/setal", handlers.SetAL)
	mux.HandleFunc("/settl", handlers.SetTL)
	mux.HandleFunc("/scorevspt", handlers.ScoreVSPT)
	mux.HandleFunc("/scoresa", handlers.ScoreSA)
	mux.HandleFunc("/starttest", handlers.StartTest)
	mux.HandleFunc("/submitbasket", handlers.SubmitBasket)
	mux.HandleFunc("/submitquestionnaire", handlers.SubmitQuestionnaire)

	log.Fatal(http.ListenAndServe(":" + os.Getenv("PORT"), session.SessionManager.LoadAndSave(mux)))
}

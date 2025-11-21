package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/adrianfish/dialang-web/datacapture"
	"github.com/adrianfish/dialang-web/models"
	"github.com/adrianfish/dialang-web/session"
	"github.com/adrianfish/dialang-web/utils"
)

func SetTL(w http.ResponseWriter, r *http.Request) {

	r.ParseMultipartForm(1024)

	dialangSession := session.SessionManager.Get(r.Context(), "session").(models.DialangSession)

	log.Printf("dialangSession: %v\n", dialangSession)

	dialangSession.ResetPass()

	dialangSession.TES.TL = r.FormValue("tl")
	dialangSession.TES.Skill = r.FormValue("skill")

	if dialangSession.TES.TL == "" || dialangSession.TES.Skill == "" {
		http.Error(w, "No test language or skill supplied", http.StatusBadRequest)
		return
	}

	dialangSession.PassId = utils.GenerateUUID()

	dialangSession.Referrer = r.Referer()
	dialangSession.IPAddress = r.RemoteAddr

	if dialangSession.SessionId == "" {
		dialangSession.SessionId = utils.GenerateUUID()
		if err := datacapture.CreateSessionAndPass(&dialangSession); err != nil {
			http.Error(w, "Failed to create session and pass", http.StatusInternalServerError)
			return
		}
	} else {
		if err := datacapture.CreatePass(&dialangSession); err != nil {
			http.Error(w, "Failed to create pass", http.StatusInternalServerError)
			return
		}
	}

	session.SessionManager.Put(r.Context(), "session", dialangSession)

	json.NewEncoder(w).Encode(map[string]string{
		"passId":    dialangSession.PassId,
		"sessionId": dialangSession.SessionId,
	})
}

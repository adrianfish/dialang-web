package handlers

import (
	"encoding/json"
	"net/http"
	"log"

	"github.com/dialangproject/web/utils"
	"github.com/dialangproject/web/datacapture"
	"github.com/dialangproject/web/models"
	"github.com/dialangproject/web/session"
)

func SetTL(w http.ResponseWriter, r *http.Request) {

	r.ParseMultipartForm(1024)

	dialangSession := session.SessionManager.Get(r.Context(), "session").(models.DialangSession)

	log.Printf("dialangSession: %v\n", dialangSession)

	v := models.SetTLParams{}

	v.Tl = r.FormValue("tl")
	v.Skill = r.FormValue("skill")
	if v.Tl == "" || v.Skill == "" {
		http.Error(w, "No test language or skill supplied", http.StatusBadRequest)
		return
	}

	v.PassId = utils.GenerateUUID()

	v.Referrer = r.Referer()
	realIP := r.Header.Get("X-Real-IP")
	forwardedFor := r.Header.Values("X-Forwarded-For")
	log.Printf("forwardedFor: %v\n", forwardedFor)
	log.Printf("realIP: %v\n", realIP)
	v.IPAddress = r.RemoteAddr
	log.Printf("IP Address: %v\n", v.IPAddress)

	if v.SessionId == "" {
    	v.SessionId = utils.GenerateUUID()
		if err := datacapture.CreateSessionAndPass(&v); err != nil {
			http.Error(w, "Failed to create session and pass", http.StatusInternalServerError)
			return
		}
	} else {
		if err := datacapture.CreatePass(&v); err != nil {
			http.Error(w, "Failed to create pass", http.StatusInternalServerError)
			return
		}
	}

	dialangSession.SessionId = v.SessionId
	dialangSession.PassId = v.PassId
	dialangSession.TES.TL = v.Tl
	dialangSession.TES.Skill = v.Skill

	session.SessionManager.Put(r.Context(), "session", dialangSession)

	json.NewEncoder(w).Encode(map[string]string{
		"passId": v.PassId,
		"sessionId": v.SessionId,
	})
}

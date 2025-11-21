package handlers

import (
	"encoding/json"
	"github.com/adrianfish/dialang-web/datacapture"
	"github.com/adrianfish/dialang-web/models"
	"github.com/adrianfish/dialang-web/scoring"
	"github.com/adrianfish/dialang-web/session"
	"log"
	"net/http"
	"strings"
)

func ScoreSA(w http.ResponseWriter, r *http.Request) {

	dialangSession := session.SessionManager.Get(r.Context(), "session").(models.DialangSession)

	if dialangSession.TES.TL == "" || dialangSession.TES.Skill == "" {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	decoder := json.NewDecoder(r.Body)
	var saResponses map[string]string
	if err := decoder.Decode(&saResponses); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	skill := dialangSession.TES.Skill

	responses := map[string]bool{}
	for name, v := range saResponses {
		if strings.HasPrefix(name, "statement:") {
			wid := strings.Split(name, ":")[1]
			responses[wid] = v == "yes"
		}
	}

	saPPE, saLevel, err := scoring.GetSaPPEAndLevel(skill, responses)
	if err != nil {
		log.Printf("Failed to score self assessment for skill %s\n", skill)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	dialangSession.SaPPE = saPPE
	dialangSession.SaSubmitted = true
	dialangSession.SaLevel = saLevel

	session.SessionManager.Put(r.Context(), "session", dialangSession)

	datacapture.LogSAResponses(&dialangSession, responses)
	datacapture.LogSAScores(&dialangSession)

	json.NewEncoder(w).Encode(map[string]any{"saPPE": saPPE, "saLevel": saLevel})
	return
}

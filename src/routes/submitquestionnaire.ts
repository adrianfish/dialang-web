package handlers

import (
	"github.com/adrianfish/dialang/api/datacapture"
	"github.com/adrianfish/dialang/api/models"
	"github.com/adrianfish/dialang/api/session"
	"net/http"
)

func SubmitQuestionnaire(w http.ResponseWriter, r *http.Request) {

	dialangSession := session.SessionManager.Get(r.Context(), "session").(models.DialangSession)
	datacapture.StoreQuestionnaire(dialangSession.SessionId, r)

	w.WriteHeader(http.StatusOK)
}

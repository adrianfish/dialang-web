package handlers

import (
	"github.com/adrianfish/dialang-web/datacapture"
	"github.com/adrianfish/dialang-web/models"
	"github.com/adrianfish/dialang-web/session"
	"net/http"
)

func SubmitQuestionnaire(w http.ResponseWriter, r *http.Request) {

	dialangSession := session.SessionManager.Get(r.Context(), "session").(models.DialangSession)
	datacapture.StoreQuestionnaire(dialangSession.SessionId, r)

	w.WriteHeader(http.StatusOK)
}

package handlers

import (
	"github.com/dialangproject/web/datacapture"
	"github.com/dialangproject/web/models"
	"github.com/dialangproject/web/session"
	"net/http"
)

func SubmitQuestionnaire(w http.ResponseWriter, r *http.Request) {

	dialangSession := session.SessionManager.Get(r.Context(), "session").(models.DialangSession)
	datacapture.StoreQuestionnaire(dialangSession.SessionId, r)

	w.WriteHeader(http.StatusOK)
}

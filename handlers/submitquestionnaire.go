package handlers

import (
	"net/http"
	"github.com/dialangproject/web/session"
	"github.com/dialangproject/web/models"
	"github.com/dialangproject/web/datacapture"
)

func SubmitQuestionnaire(w http.ResponseWriter, r *http.Request) {

	dialangSession := session.SessionManager.Get(r.Context(), "session").(models.DialangSession)
	datacapture.StoreQuestionnaire(dialangSession.SessionId, r)

	w.WriteHeader(http.StatusOK)
}

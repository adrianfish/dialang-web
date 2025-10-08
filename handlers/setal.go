package handlers

import (
	"net/http"
	"github.com/dialangproject/web/models"
	"github.com/dialangproject/web/session"
)

func SetAL(w http.ResponseWriter, r *http.Request) {

	if err := r.ParseMultipartForm(1024); err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	al := r.FormValue("al")
	if al == "" {
		http.Error(w, "No admin language supplied", http.StatusBadRequest)
		return
	}

	// Setup a new dialang session with the admin language set in the test execution script (TES)
	dialangSession := models.DialangSession{TES: models.TES{AL: al}}

	session.SessionManager.Put(r.Context(), "session", dialangSession)

	w.WriteHeader(http.StatusOK)
}

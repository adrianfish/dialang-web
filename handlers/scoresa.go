package handlers

import (
	"encoding/json"
	"strings"
	"net/http"
	"log"
	"github.com/dialangproject/web/scoring"
	"github.com/dialangproject/web/models"
	"github.com/dialangproject/web/session"
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

	log.Println(responses)

	saPPE, saLevel, err := scoring.GetSaPPEAndLevel(skill, responses);

	if err != nil {
		log.Printf("Failed to score self assessment for skill %s\n", skill)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"saPPE": saPPE, "saLevel": saLevel})
	return

	/*
	await docClient.send(
		new UpdateCommand({
		  TableName: "dialang-data-capture",
		  Key: { "session_id": body.sessionId },
		  ExpressionAttributeValues: { ":sar": JSON.stringify(responses), ":sal": saLevel, ":sap": saPPE },
		  UpdateExpression: "set sa_responses_json = :sar, sa_level = :sal, sa_ppe = :sap",
		  ReturnValues: "ALL_NEW",
		})
	);
    */
}

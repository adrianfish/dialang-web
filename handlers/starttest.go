package handlers

import (
	"encoding/json"
	"fmt"
	"github.com/dialangproject/web/data"
	"github.com/dialangproject/web/datacapture"
	"github.com/dialangproject/web/models"
	"github.com/dialangproject/web/session"
	"github.com/dialangproject/web/utils"
	"log"
	"net/http"
)

func StartTest(w http.ResponseWriter, r *http.Request) {

	dialangSession := session.SessionManager.Get(r.Context(), "session").(models.DialangSession)

	if dialangSession.TES.TL == "" || dialangSession.TES.Skill == "" {
		log.Println("Neither the test language or skill were set in the session. Returning 500 ...")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if len(dialangSession.ScoredItems) > 0 {
		log.Println("The scored item list should be empty at this point. Returning 500 ...")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	dialangSession.BookletId = calculateBookletId(&dialangSession)
	log.Printf("BOOKLET ID: %d\n", dialangSession.BookletId)

	bookletLength := data.BookletLengths[dialangSession.BookletId]
	log.Printf("BOOKLET LENGTH: %v\n", bookletLength)

	dialangSession.CurrentBasketId = data.BookletBaskets[dialangSession.BookletId][0]
	log.Printf("First Basket Id: %v\n", dialangSession.CurrentBasketId)

	if dialangSession.SessionId == "" {
		// No session yet. This could happen in an LTI launch
		dialangSession.SessionId = utils.GenerateUUID()
	}

	session.SessionManager.Put(r.Context(), "session", dialangSession)

	datacapture.LogTestStart(&dialangSession.PassId, &dialangSession.BookletId, &dialangSession.BookletLength)
	//
	/*
	  await docClient.send(
	    new UpdateCommand({
	      TableName: "dialang-data-capture",
	      Key: { "session_id": body.sessionId },
	      ExpressionAttributeValues: { ":vr": JSON.stringify(responses), ":vs": JSON.stringify([zScore, mearaScore, level]) },
	      UpdateExpression: "set vspt_responses_json = :vr, vspt_scores = :vs",
	      ReturnValues: "ALL_NEW",
	    })
	  );

	  const response = { session };

	  return {
	    statusCode: 200,
	    headers: { "Content-Type": "application/json" },
	    body: JSON.stringify(response),
	  };
	*/
	json.NewEncoder(w).Encode(map[string]any{"startBasket": dialangSession.CurrentBasketId, "totalItems": bookletLength})
	return
}

/**
 * Calculates the booklet id.
 *
 * If neither the VSPT nor the SA have been submitted, requests the midmost booklet assignment
 * from the the PreestAssign member. Gets the grade achieved for SA together with the
 * Z score for the VSPT, if submitted. Calls getPreestWeights to get a
 * PreestWeights object. Uses this object to get the SA and VSPT weights
 * and 'Coefficient of Mystery' for the current TLS SKILL and vspt/sa
 * submitted states. Uses the VSPT and SA weights  and coefficient to
 * calculate a theta estimate (ppe). Passes the TLS, SKILL and coefficient
 * in the PreestAssign.
 */
func calculateBookletId(dialangSession *models.DialangSession) int {

	key := fmt.Sprintf("%s#%s", dialangSession.TES.TL, dialangSession.TES.Skill)

	if dialangSession.VsptSubmitted == false && dialangSession.SaSubmitted == false {
		log.Println("No vsp or sa submitted")
		// No sa or vspt, request the default assignment.
		log.Println(data.PreestAssignments[key])
		return data.PreestAssignments[key][1].BookletId
	} else {
		log.Println("vsp or sa submitted")
		// if either test is done, then we need to get the grade
		// associated with that test:

		var vsptZScore, saPPE float64
		if dialangSession.VsptSubmitted {
			vsptZScore = dialangSession.VsptZScore
			log.Printf("VSPT SUBMITTED. vsptZScore: %f\n", vsptZScore)
		}
		if dialangSession.SaSubmitted {
			saPPE = dialangSession.SaPPE
			log.Printf("SA SUBMITTED. saPPE: %f\n", saPPE)
		}
		weightKey := fmt.Sprintf("%s#%d#%d", key, dialangSession.VsptSubmitted, dialangSession.SaSubmitted)
		weight := data.PreestWeights[weightKey]
		pe := (saPPE * weight.Sa) + (vsptZScore * weight.Vspt) + weight.Coe

		log.Printf("PE: %f\n", pe)

		log.Println(key)
		log.Println(data.PreestAssignments[key])

		var bookletId int
		for _, ass := range data.PreestAssignments[key] {
			fmt.Println(ass.Pe)
			if pe <= ass.Pe {
				bookletId = ass.BookletId
				break
			}
		}
		return bookletId
	}
}

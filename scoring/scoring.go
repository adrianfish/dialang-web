package scoring

import (
	"fmt"
	"log"
	"errors"
	"strings"
	"slices"
	"strconv"
	"github.com/dialangproject/web/db"
	"github.com/dialangproject/web/data"
	"github.com/dialangproject/web/models"
)


var CEFR_LEVELS = map[int]string{ 1: "A1", 2: "A2", 3: "B1", 4: "B2", 5: "C1", 6: "C2" }

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
func CalculateBookletId(dialangSession *models.DialangSession) int {

	key := fmt.Sprintf("%s#%s", dialangSession.TES.TL, dialangSession.TES.Skill)

	if dialangSession.TestDifficulty != "" {
      	switch dialangSession.TestDifficulty {
        	case "easy":
          		return data.PreestAssignments[key][0].BookletId
        	case "hard":
          		return data.PreestAssignments[key][2].BookletId
        	default:
          		return data.PreestAssignments[key][1].BookletId
		}
	}

    if dialangSession.VsptSubmitted == false && dialangSession.SaSubmitted == false {
		log.Println("No vsp or sa submitted")
      	// No sa or vspt, request the default assignment.
      	return data.PreestAssignments[key][1].BookletId
    } else {
		log.Println("vsp or sa submitted")
      	// if either test is done, then we need to get the grade 
      	// associated with that test:

		var vsptZScore, saPPE  float64
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
				break;
			}
		}
		return bookletId
    }
}

/**
 * Returns the sum of the weights of the questions answered 'true'
 */
func getSaRawScore(skill string, responses map[string]bool) int {

	var wordMap map[string]int = data.SAWeights[skill]

	var score int

	for id, response := range responses {
		if response {
			// They responded true to this statement, add its weight.
			score += wordMap[id]
		}
	}

	return score
}

func GetSaPPEAndLevel(skill string, responses map[string]bool) (float64, string, error) {

	rsc := getSaRawScore(skill, responses)
	for _, g := range data.SAGrades {
		if g.Skill == skill && g.Rsc == rsc {
			return g.Ppe, CEFR_LEVELS[g.Grade], nil
		}
	}

	return 0, "", errors.New("Failed to match skill and raw score to an sa grade")
}

/**
 * Used for mcq and gap drop
 */
func GetScoredIdResponseItem(itemId int, responseId int) (*models.ScoredItem, error) {

	item, iErr := db.GetItem(itemId)
	if iErr != nil {
		return nil, errors.New("Failed to get item for itemId: " + strconv.Itoa(itemId))
	}

	scoredItem := models.ScoredItem{Item: item}
	scoredItem.ResponseId = responseId

	answer, aErr := db.GetAnswer(responseId)
	if aErr != nil {
		return nil, errors.New("Failed to get answer for responseId: " + strconv.Itoa(responseId))
	}

	if answer.Correct == 1 {
	  scoredItem.Correct = true
	  scoredItem.Score = item.Weight
	} else {
	  // Score will remain 0
	  scoredItem.Correct = false
	}

	return &scoredItem, nil
}

func GetScoredTextResponseItem(itemId int, answerText string) (*models.ScoredItem, error) {

	item, err := db.GetItem(itemId)
	if err != nil {
		return nil, errors.New("Failed to get item for itemId: " + strconv.Itoa(itemId))
	}

	scoredItem := models.ScoredItem{Item: item}
	scoredItem.ResponseText = answerText

	for _, correctAnswer := range db.GetAnswersForItem(itemId) {
		if removeWhiteSpaceAndPunctuation(correctAnswer.Text) == removeWhiteSpaceAndPunctuation(answerText) {
			scoredItem.Score = item.Weight;
			scoredItem.Correct = true
			break
		}
	}
	return &scoredItem, nil
}

func GetItemGrade(tl string, skill string, bookletId int, scoredItems []*models.ScoredItem) (int, int, string) {

    log.Printf("NUM ITEMS: %d\n", len(scoredItems))

	var rawScore, totalWeight int
	for _, item := range scoredItems {
		rawScore += item.Score
		totalWeight += item.Item.Weight
	}

	log.Printf("RAW SCORE: %d\n", rawScore)
	log.Printf("TOTAL WEIGHT: %d\n", totalWeight)

	itemGrades, err := db.GetItemGrades(tl, skill, bookletId)
	if err != nil {
		log.Printf("Failed to get item grades for skill %s\n", skill)
		return rawScore, 0, CEFR_LEVELS[1]
	}

	if itemGrade, ok := itemGrades[rawScore]; ok {
    	return rawScore, itemGrade.Grade, CEFR_LEVELS[itemGrade.Grade]
	} else {
		log.Printf("No item grade for raw score %d. Returning default grade ...\n", rawScore)
    	return rawScore, 0, CEFR_LEVELS[1]
	}
}

/**
 *  Trim leading and trailing whitespace and then replace tab, newline,
 *  carriage return and form-feed characters with a whitespace.
 */
func removeWhiteSpaceAndPunctuation(in string) string {

	punctuationList := db.GetPunctuation()
    if len(punctuationList) <= 0 {
		log.Println("No punctuation list found. Returning input unchanged ...")
    	return in
  	}

	// Trim the white space, tokenize and join around space
	firstPass := strings.Join(strings.Fields(in), " ")

	for _, testChar := range firstPass {
		if slices.Contains(punctuationList, fmt.Sprintf("%x", testChar)) {
			firstPass = strings.Replace(firstPass, string(testChar), "", -1)
		}
	}

	return strings.ToLower(firstPass)
}

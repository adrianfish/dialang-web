package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	commonmodels "github.com/dialangproject/common/models"
	"github.com/dialangproject/web/data"
	"github.com/dialangproject/web/datacapture"
	"github.com/dialangproject/web/models"
	"github.com/dialangproject/web/session"
	"log"
	"math"
	"net/http"
	"strings"
)

func ScoreVSPT(w http.ResponseWriter, r *http.Request) {

	var vsptResponses map[string]string
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&vsptResponses)
	if err != nil {
		log.Fatal(err)
	}

	responses := map[string]bool{}
	for k, v := range vsptResponses {
		if strings.HasPrefix(k, "word:") {
			id := strings.Split(k, ":")[1]
			responses[id] = v == "valid"
		}
	}

	dialangSession := session.SessionManager.Get(r.Context(), "session").(models.DialangSession)

	zScore, mearaScore, level, err := getBand(dialangSession.TES.TL, responses)
	if err != nil {
		log.Fatal(err)
	}

	dialangSession.VsptZScore = zScore
	dialangSession.VsptMearaScore = mearaScore
	dialangSession.VsptLevel = level
	dialangSession.VsptSubmitted = true

	session.SessionManager.Put(r.Context(), "session", dialangSession)

	datacapture.LogVSPTResponses(&dialangSession, responses)
	datacapture.LogVSPTScores(&dialangSession)

	json.NewEncoder(w).Encode(map[string]any{"vsptZScore": zScore, "vsptMearaScore": mearaScore, "vsptLevel": level})
}

func getBand(tl string, responses map[string]bool) (float64, int, string, error) {

	zScore, mearaScore := getScore(tl, responses)
	bands, ok := data.VSPTBands[tl]
	if !ok {
		return 0, 0, "", errors.New(fmt.Sprintf("No bands for test language '%s'", tl))
	}

	for _, b := range bands {
		log.Println(b)
		if mearaScore >= float64(b.Low) && mearaScore <= float64(b.High) {
			return zScore, int(math.Round(mearaScore)), b.Level, nil
		}
	}

	return 0, 0, "", errors.New(fmt.Sprintf("No level for test language '%s' and meara score: %f.", tl, mearaScore))
}

func getScore(tl string, responses map[string]bool) (float64, float64) {

	Z := getZScore(tl, responses)

	log.Printf("Z Score: %f\n", Z)

	if Z <= 0 {
		return Z, 0
	} else {
		return Z, Z * 1000
	}
}

func getWordType(word *commonmodels.VSPTWord) int {

	var wordType int
	if word.Valid == 1 {
		wordType = 1
	}
	return wordType
}

func getZScore(tl string, responses map[string]bool) float64 {

	yesResponses := []int{0, 0}
	noResponses := []int{0, 0}

	words, ok := data.VSPTWords[tl]
	if !ok {
		log.Fatal("No vspt words for language", tl)
	}

	for _, word := range words {
		wordType := getWordType(&word)

		if responses[word.WordId] {
			yesResponses[wordType] += 1
		} else {
			noResponses[wordType] += 1
		}
	}

	realWordsAnswered := yesResponses[1] + noResponses[1]

	fakeWordsAnswered := yesResponses[0] + noResponses[0]

	// Hits. The number of yes responses to real words.
	hits := yesResponses[1]

	// False alarms. The number of yes responses to fake words.
	falseAlarms := yesResponses[0]

	if hits == 0 {
		// No hits whatsoever results in a zero score
		return 0
	} else {
		return getVersion10ZScore(hits, realWordsAnswered, falseAlarms, fakeWordsAnswered)
	}
}

func getVersion10ZScore(hits int, realWordsAnswered int, falseAlarms int, fakeWordsAnswered int) float64 {

	h := float64(hits) / float64(realWordsAnswered)

	// The false alarm rate. False alarms divided by the total number of fake words answered.
	f := float64(falseAlarms) / float64(fakeWordsAnswered)

	if h == 1 && f == 1 {
		// This means the test taker has just clicked green for all the words
		return -1
	} else {
		rhs := ((4 * h * (1 - f)) - (2 * (h - f) * (1 + h - f))) / ((4 * h * (1 - f)) - ((h - f) * (1 + h - f)))
		return 1 - rhs
	}
}

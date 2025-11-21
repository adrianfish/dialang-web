package handlers

import (
	"encoding/json"
	"github.com/adrianfish/dialang-web/data"
	"github.com/adrianfish/dialang-web/datacapture"
	"github.com/adrianfish/dialang-web/models"
	"github.com/adrianfish/dialang-web/scoring"
	"github.com/adrianfish/dialang-web/session"
	"log"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"strings"
)

func SubmitBasket(w http.ResponseWriter, r *http.Request) {

	dialangSession := session.SessionManager.Get(r.Context(), "session").(models.DialangSession)

	if dialangSession.TES.TL == "" || dialangSession.TES.Skill == "" || dialangSession.CurrentBasketId == 0 {
		log.Println("None of the test language, skill or current basket id were set in the session. Returning 500 ...")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	basketType := r.FormValue("basketType")
	if basketType == "" {
		log.Println("No basketType supplied. Returning 400 (Bad Request) ...")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	positionInBasketSorter := func(a, b *models.ScoredItem) int {
		return a.PositionInBasket - b.PositionInBasket
	}

	numScoredItems := len(dialangSession.ScoredItems)
	currentBasketId := dialangSession.CurrentBasketId

	log.Printf("basketType: %v\n", basketType)
	log.Printf("currentBasketId: %v\n", currentBasketId)
	log.Printf("currentBasketNumber: %v\n", dialangSession.CurrentBasketNumber)
	log.Printf("scored item list length: %v\n", numScoredItems)

	returnMap := map[string]any{}

	itemList := dialangSession.ScoredItems

	switch basketType {
	case "mcq":
		{
			log.Println("mcq")
			itemId, itemIdErr := strconv.Atoi(r.FormValue("itemId"))
			if itemIdErr != nil {
				log.Println("Invalid or missing item id. Returning 400 (Bad Request) ...")
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			answerId, responseIdErr := strconv.Atoi(r.FormValue("response"))
			if responseIdErr != nil {
				log.Println("No response supplied. Returning 400 (Bad Request) ...")
				w.WriteHeader(http.StatusBadRequest)
				return
			}

			if scoredItem, err := scoring.GetScoredIdResponseItem(itemId, answerId); err != nil {
				log.Printf("Failed to get scored item for itemId %d and responseId %d\n", strconv.Itoa(itemId), strconv.Itoa(answerId))
				w.WriteHeader(http.StatusInternalServerError)
				return
			} else {
				scoredItem.BasketId = dialangSession.CurrentBasketId
				scoredItem.PositionInBasket = 1
				scoredItem.ResponseId = answerId
				scoredItem.PositionInTest = numScoredItems + 1
				log.Printf("Item position in test: %d\n", scoredItem.PositionInTest)
				scoredItem.Answers = data.ItemAnswers[itemId]
				itemList = append(itemList, scoredItem)
				scoredBasket := models.ScoredBasket{Id: currentBasketId, Type: "mcq", Skill: scoredItem.Item.Skill, Items: []*models.ScoredItem{scoredItem}}
				dialangSession.ScoredBaskets = append(dialangSession.ScoredBaskets, &scoredBasket)
				returnMap["scoredBasket"] = scoredBasket
				datacapture.LogSingleIdResponse(dialangSession.PassId, scoredItem)
			}
		}

	case "tabbedpane":
		{
			itemsToLog := []*models.ScoredItem{}
			responses := getMultipleIdResponses(&r.Form)
			basketItems := []*models.ScoredItem{}
			for itemId, answerId := range responses {
				if item, err := scoring.GetScoredIdResponseItem(itemId, answerId); err == nil {
					item.ResponseId = answerId
					position := r.FormValue(strconv.Itoa(item.Item.Id) + "-position")
					if position != "" {
						if positionInBasket, err := strconv.Atoi(position); err == nil {
							item.PositionInBasket = positionInBasket
						} else {
							log.Printf("Failed to convert positionInBasket to int: %w\n", err)
						}
					} else {
						log.Printf("No position supplied for item '%d. Returning 400 (Bad Request) ...\n", item.Item.Id)
						w.WriteHeader(http.StatusBadRequest)
						return
					}

					item.BasketId = currentBasketId
					item.PositionInTest = numScoredItems + item.PositionInBasket
					log.Printf("Item position in basket: %d\n", item.PositionInBasket)
					log.Printf("Item position in test: %d\n", item.PositionInTest)
					log.Println(item.BasketId)
					item.Answers = data.ItemAnswers[item.Item.Id]
					itemsToLog = append(itemsToLog, item)
					itemList = append(itemList, item)
					basketItems = append(basketItems, item)
				} else {
					log.Println("No item returned from scoring")
				}
			}
			slices.SortFunc(basketItems, positionInBasketSorter)
			scoredBasket := models.ScoredBasket{Id: currentBasketId, Type: "tabbedpane", Skill: basketItems[0].Item.Skill, Items: basketItems}
			dialangSession.ScoredBaskets = append(dialangSession.ScoredBaskets, &scoredBasket)
			returnMap["scoredBasket"] = scoredBasket
			datacapture.LogMultipleIdResponses(dialangSession.PassId, itemsToLog)
		}

	case "shortanswer":
		{
			responses := getMultipleTextualResponses(&r.Form)
			basketItems := []*models.ScoredItem{}
			itemsToLog := []*models.ScoredItem{}
			for itemId, responseText := range responses {
				if item, err := scoring.GetScoredTextResponseItem(itemId, responseText); err == nil {
					item.BasketId = currentBasketId
					item.ResponseText = responseText
					position := r.FormValue(strconv.Itoa(item.Item.Id) + "-position")
					if position != "" {
						if positionInBasket, err := strconv.Atoi(position); err == nil {
							item.PositionInBasket = positionInBasket
						} else {
							log.Printf("Failed to convert positionInBasket to int: %s\n", err)
						}
					} else {
						log.Printf("No position supplied for item '%d. Returning 400 (Bad Request) ...\n", item.Item.Id)
						w.WriteHeader(http.StatusBadRequest)
						return
					}
					item.PositionInTest = numScoredItems + item.PositionInBasket
					log.Printf("Item position in test: %d\n", item.PositionInTest)
					item.Answers = data.ItemAnswers[item.Item.Id]
					itemList = append(itemList, item)
					itemsToLog = append(itemsToLog, item)
					basketItems = append(basketItems, item)
				} else {
					log.Println("No item returned from scoring")
				}
			}
			slices.SortFunc(basketItems, positionInBasketSorter)
			scoredBasket := models.ScoredBasket{Id: currentBasketId, Type: "shortanswer", Skill: basketItems[0].Item.Skill, Items: basketItems}
			dialangSession.ScoredBaskets = append(dialangSession.ScoredBaskets, &scoredBasket)
			returnMap["scoredBasket"] = scoredBasket
			datacapture.LogMultipleTextualResponses(dialangSession.PassId, itemsToLog)
		}

	case "gaptext":
		{
			responses := getMultipleTextualResponses(&r.Form)
			basketItems := []*models.ScoredItem{}
			itemsToLog := []*models.ScoredItem{}

			for itemId, responseText := range responses {
				if item, err := scoring.GetScoredTextResponseItem(itemId, responseText); err == nil {
					item.BasketId = currentBasketId
					item.ResponseText = responseText
					position := r.FormValue(strconv.Itoa(item.Item.Id) + "-position")
					if position != "" {
						if positionInBasket, err := strconv.Atoi(position); err == nil {
							item.PositionInBasket = positionInBasket
						} else {
							log.Printf("Failed to convert positionInBasket to int: %s\n", err)
						}
					} else {
						log.Printf("No position supplied for item '%d. Returning 400 (Bad Request) ...\n", item.Item.Id)
						w.WriteHeader(http.StatusBadRequest)
						return
					}
					item.PositionInTest = numScoredItems + item.PositionInBasket
					log.Printf("Item position in test: %d\n", item.PositionInTest)
					item.Answers = data.ItemAnswers[item.Item.Id]
					itemList = append(itemList, item)
					itemsToLog = append(itemsToLog, item)
					basketItems = append(basketItems, item)
				} else {
					log.Println("No item returned from scoring")
				}
			}
			slices.SortFunc(basketItems, positionInBasketSorter)
			scoredBasket := models.ScoredBasket{Id: currentBasketId, Type: "gaptext", Skill: basketItems[0].Item.Skill, Items: basketItems}
			dialangSession.ScoredBaskets = append(dialangSession.ScoredBaskets, &scoredBasket)
			returnMap["scoredBasket"] = scoredBasket
			datacapture.LogMultipleTextualResponses(dialangSession.PassId, itemsToLog)
		}

	case "gapdrop":
		{
			responses := getMultipleIdResponses(&r.Form)
			basketItems := []*models.ScoredItem{}
			itemsToLog := []*models.ScoredItem{}
			for itemId, responseId := range responses {
				if item, err := scoring.GetScoredIdResponseItem(itemId, responseId); err == nil {
					item.BasketId = currentBasketId
					item.ResponseId = responseId

					position := r.FormValue(strconv.Itoa(item.Item.Id) + "-position")
					if position != "" {
						if positionInBasket, err := strconv.Atoi(position); err == nil {
							item.PositionInBasket = positionInBasket
						} else {
							log.Printf("Failed to convert positionInBasket to int: %s\n", err)
							w.WriteHeader(http.StatusBadRequest)
							return
						}
					} else {
						log.Printf("No position supplied for item '%d. Returning 400 (Bad Request) ...\n", item.Item.Id)
						w.WriteHeader(http.StatusBadRequest)
						return
					}

					item.PositionInTest = numScoredItems + item.PositionInBasket
					log.Printf("Item position in test: %d\n", item.PositionInTest)
					item.Answers = data.ItemAnswers[item.Item.Id]
					itemList = append(itemList, item)
					itemsToLog = append(itemsToLog, item)
					basketItems = append(basketItems, item)
				} else {
					log.Printf("No item returned from scoring: %w\n", err)
				}
			}

			slices.SortFunc(basketItems, positionInBasketSorter)
			scoredBasket := models.ScoredBasket{Id: currentBasketId, Type: "gapdrop", Skill: basketItems[0].Item.Skill, Items: basketItems}
			dialangSession.ScoredBaskets = append(dialangSession.ScoredBaskets, &scoredBasket)
			returnMap["scoredBasket"] = scoredBasket
			datacapture.LogMultipleIdResponses(dialangSession.PassId, itemsToLog)
		}

	default:
		{
			log.Println("Unrecognised basketType supplied. Returning 400 (Bad Request) ...")
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	}

	dialangSession.ScoredItems = itemList

	nextBasketNumber := dialangSession.CurrentBasketNumber + 1
	log.Printf("nextBasketNumber: %d\n", nextBasketNumber)

	basketIds := data.BookletBaskets[dialangSession.BookletId]

	if nextBasketNumber >= len(basketIds) {
		// The test has finished. Grade it.
		rawScore, itemGrade, itemLevel := scoring.GetItemGrade(dialangSession.TES.TL,
			dialangSession.TES.Skill,
			dialangSession.BookletId,
			itemList)

		log.Printf("ITEM GRADE: %d\n", itemGrade)

		dialangSession.ItemRawScore = rawScore
		dialangSession.ItemGrade = itemGrade
		dialangSession.ItemLevel = itemLevel

		session.SessionManager.Put(r.Context(), "session", dialangSession)

		datacapture.LogTestResult(&dialangSession)
		datacapture.LogTestFinish(dialangSession.PassId)

		if dialangSession.ResultUrl != "" {
			parts := strings.Split(dialangSession.ResultUrl, "?")
			var params strings.Builder
			if len(parts) == 2 {
				params.WriteString("?")
				params.WriteString(parts[1])
				params.WriteString("&")
			} else {
				params.WriteString("?")
			}
			params.WriteString("itemGrade=")
			params.WriteString(strconv.Itoa(itemGrade))
			if dialangSession.SaLevel != "" {
				params.WriteString("&saLevel=")
				params.WriteString(dialangSession.SaLevel)
			}
			if dialangSession.VsptLevel != "" {
				params.WriteString("&vsptLevel=")
				params.WriteString(dialangSession.VsptLevel)
			}
			url := parts[0] + params.String()
			log.Printf("Redirect URL: %v\n", url)
			returnMap["redirect"] = url
			json.NewEncoder(w).Encode(returnMap)
		} else {
			// We set testDone to true so the client js knows to enable the sa feedback and advice buttons
			returnMap["itemLevel"] = itemLevel
			returnMap["testDone"] = "true"
			json.NewEncoder(w).Encode(returnMap)
		}
	} else {
		datacapture.LogBasket(dialangSession.PassId, currentBasketId, dialangSession.CurrentBasketNumber)

		nextBasketId := basketIds[nextBasketNumber]

		dialangSession.CurrentBasketNumber = nextBasketNumber
		dialangSession.CurrentBasketId = nextBasketId
		session.SessionManager.Put(r.Context(), "session", dialangSession)

		returnMap["nextBasketId"] = nextBasketId
		returnMap["itemsCompleted"] = len(itemList)

		json.NewEncoder(w).Encode(returnMap)
	}
}

func getMultipleIdResponses(params *url.Values) map[int]int {

	responses := map[int]int{}

	for k, v := range *params {
		if !strings.HasSuffix(k, "-response") {
			continue
		}
		if itemId, err := strconv.Atoi(strings.Split(k, "-")[0]); err == nil {
			log.Println("Failed to convert item id to int", err)
			if answerId, err := strconv.Atoi(v[0]); err == nil {
				responses[itemId] = answerId
			} else {
				log.Println("Failed to convert answer id to int", err)
			}
		} else {
			log.Println("Failed to convert item id to int", err)
		}
	}
	return responses
}

/**
 * Returns a map of response text on to itemId
 */
func getMultipleTextualResponses(params *url.Values) map[int]string {

	responses := map[int]string{}

	for k, v := range *params {
		if !strings.HasSuffix(k, "-response") {
			continue
		}

		if itemId, err := strconv.Atoi(strings.Split(k, "-")[0]); err == nil {
			responses[itemId] = v[0]
		} else {
			log.Println("Failed to convert item id to int", err)
		}
	}

	return responses
}

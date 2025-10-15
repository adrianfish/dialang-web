package models

import (
	"encoding/gob"
	commonmodels "github.com/dialangproject/common/models"
)

type SetTLParams struct {
	SessionId     string `json:"sessionId"`
	PassId        string `json:"passId"`
	Al            string `json:"al"`
	Tl            string `json:"tl"`
	Skill         string `json:"skill"`
	IPAddress     string
	BrowserLocale string
	Referrer      string
}

type DialangSession struct {
	SessionId           string          `json:"sessionId"`
	PassId              string          `json:"passId"`
	VsptSubmitted       bool            `json:"vsptSubmitted"`
	VsptMearaScore      int             `json:"vsptMearaScore"`
	VsptZScore          float64         `json:"vsptZScore"`
	VsptLevel           string          `json:"vsptLevel"`
	SaSubmitted         bool            `json:"saSubmitted"`
	SaPPE               float64         `json:"saPPE"`
	SaLevel             string          `json:"saLevel"`
	SaDone              bool            `json:"saDone"`
	BookletId           int             `json:"bookletId"`
	BookletLength       int             `json:"bookletLength"`
	CurrentBasketId     int             `json:"currentBasketId"`
	CurrentBasketNumber int             `json:"currentBasketId"`
	ScoredItems         []*ScoredItem   `json:"scoredItems"`
	ScoredBaskets       []*ScoredBasket `json:"scoredbaskets"`
	ItemRawScore        int             `json:"itemRawScore"`
	ItemGrade           int             `json:"itemGrade"`
	ItemLevel           string          `json:"itemLevel"`
	ResultUrl           string          `json:"resultUrl"`
	TES                 TES             `json:"tes"`
}

func (dialangSession *DialangSession) ResetPass() {

	dialangSession.VsptSubmitted = false
	dialangSession.VsptMearaScore = 0
	dialangSession.VsptZScore = 0
	dialangSession.VsptLevel = ""
	dialangSession.SaSubmitted = false
	dialangSession.SaPPE = 0
	dialangSession.SaLevel = ""
	dialangSession.SaDone = false
	dialangSession.BookletId = 0
	dialangSession.BookletLength = 0
	dialangSession.CurrentBasketId = 0
	dialangSession.CurrentBasketNumber = 0
	dialangSession.ScoredItems = []*ScoredItem{}
	dialangSession.ScoredBaskets = []*ScoredBasket{}
	dialangSession.ItemRawScore = 0
	dialangSession.ItemGrade = 0
	dialangSession.ItemLevel = ""
}

/**
 * Test Execution Script
 */
type TES struct {
	AL                      string
	TL                      string
	Skill                   string
	HideVSPT                bool
	HideVSPTResult          bool
	HideSA                  bool
	HideTest                bool
	HideFeedbackMenu        bool
	DisallowInstantFeedback bool
	TestCompleteUrl         string
}

type ScoredItem struct {
	*commonmodels.Item
	BasketId         int                   `json:"basketId"`
	PositionInBasket int                   `json:"positionInBasket"`
	PositionInTest   int                   `json:"positionInTest"`
	ResponseId       int                   `json:"responseId"`
	ResponseText     string                `json:"responseText"`
	Correct          bool                  `json:"correct"`
	Score            int                   `json:"score"`
	Answers          []commonmodels.Answer `json:"answers"`
}

type ScoredBasket struct {
	Id    int           `json:"id"`
	Type  string        `json:"type"`
	Skill string        `json:"skill"`
	Items []*ScoredItem `json:"items"`
}

func init() {

	gob.Register(DialangSession{})
}

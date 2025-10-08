package models

import (
	"encoding/gob"
	commonmodels "github.com/dialangproject/common/models"
)

type SetTLParams struct {
	SessionId string `json:"sessionId"`
	PassId string `json:"passId"`
	Al string `json:"al"`
	Tl string `json:"tl"`
	Skill string `json:"skill"`
	IPAddress string
	BrowserLocale string
	Referrer string
}

type VSPTBand struct {
	Locale string
	Level string
	Low int
	High int
}

type VSPTWord struct {
	WordId string
	Word string
	Valid int
	Weight int
}

type SAGrade struct {
	Skill string
	Rsc int
	Ppe float64
	Se float64
	Grade int
}

type PreestWeight struct {
	Sa float64
	Vspt float64
	Coe float64
}

type PreestAssignment struct {
	Pe float64
	BookletId int
}

type DialangSession struct {
	SessionId             string      `json:"sessionId"`
	PassId             string      `json:"passId"`
	VsptDone struct {
		FraFr bool `json:"fra_fr"`
	} `json:"vsptDone"`
	ReviewBasket   any `json:"reviewBasket"`
	ReviewItemID   any `json:"reviewItemId"`
	FeedbackMode   bool        `json:"feedbackMode"`
	TestDone       bool        `json:"testDone"`
	TestDifficulty string      `json:"testDifficulty"`
	VsptSubmitted  bool        `json:"vsptSubmitted"`
	VsptMearaScore float64     `json:"vsptMearaScore"`
	VsptZScore     float64     `json:"vsptZScore"`
	VsptLevel      string      `json:"vsptLevel"`
	SaSubmitted    bool         `json:"saSubmitted"`
	SaPPE          float64     `json:"saPPE"`
	SaLevel        string         `json:"saLevel"`
	SaDone         bool        `json:"saDone"`
	BookletId	   int		   `json:"bookletId"`
	BookletLength	   int		   `json:"bookletLength"`
	CurrentBasketId int 	`json:"currentBasketId"`
	CurrentBasketNumber int 	`json:"currentBasketId"`
	ScoredItems  []*ScoredItem `json:"scoredItems"`
	ScoredBaskets  []*ScoredBasket `json:"scoredbaskets"`
	ItemRawScore int `json:"itemRawScore"`
	ItemGrade int `json:"itemGrade"`
	ItemLevel string `json:"itemLevel"`
	ResultUrl string `json:"resultUrl"`
	TES            TES         `json:"tes"`
}

type ItemGrade struct {
	PPE float64
	SE float64
	Grade int
}

/**
 * Test Execution Script
 */
type TES struct {
	AL string
	TL string
	Skill string
    HideVSPT bool
    HideVSPTResult bool
    HideSA bool
    HideTest bool
    TestDifficulty string
    HideFeedbackMenu bool
    DisallowInstantFeedback bool
    TestCompleteUrl string
}

type ScoredItem struct {
	//Item *commonmodels.Item `json:"item"`
	*commonmodels.Item
	BasketId int `json:"basketId"`
	PositionInBasket int `json:"positionInBasket"`
	PositionInTest int `json:"positionInTest"`
	ResponseId int `json:"responseId"`
	ResponseText string `json:"responseText"`
	Correct bool `json:"correct"`
	Score int `json:"score"`
	Answers []commonmodels.Answer `json:"answers"`
}

type ScoredBasket struct {
	Id int `json:"id"`
	Type string `json:"type"`
	Skill string `json:"skill"`
	Items []*ScoredItem `json:"items"`
}

func init() {

	gob.Register(DialangSession{})
}

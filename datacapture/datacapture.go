package datacapture

import (
	"log"
	"os"
	"database/sql"
	"time"

	"github.com/dialangproject/web/models"
	_ "github.com/lib/pq"
)

var db *sql.DB
var singleItemResponseStmt *sql.Stmt
var multipleItemResponseStmt *sql.Stmt
var basketStmt *sql.Stmt
var testResultStmt *sql.Stmt
var testFinishStmt *sql.Stmt

func init() {

	dbHost := os.Getenv("DIALANG_DB_HOST")
	if dbHost == "" {
		dbHost = "dialang-db-1"
	}

	log.Printf("Connecting to dialang-data-capture database at %v\n", dbHost)

	pw := "e785598fffccc098afda8eb6e42494e5"
	connStr := "postgres://dialangadmin:" + pw + "@" + dbHost + "/dialang-data-capture?sslmode=disable"
	thisDb, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	db = thisDb

	if pingErr := db.Ping(); pingErr != nil {
		log.Fatal(pingErr)
	}

	log.Println("Connected to data capture database")

	if stmt, err := db.Prepare("INSERT INTO item_responses (pass_id,basket_id,item_id,answer_text,score,correct,pass_order) VALUES($1,$2,$3,$4,$5,$6,$7)"); err != nil {
		log.Fatal(err)
	} else {
		multipleItemResponseStmt = stmt
	}

	if stmt, err := db.Prepare("INSERT INTO item_responses (pass_id,basket_id,item_id,answer_id,score,correct,pass_order) VALUES($1,$2,$3,$4,$5,$6,$7)"); err != nil {
		log.Fatal(err)
	} else {
		singleItemResponseStmt = stmt
	}

	if stmt, err := db.Prepare("INSERT INTO baskets (pass_id,basket_id,basket_number) VALUES($1,$2,$3)"); err != nil {
		log.Fatal(err)
	} else {
		basketStmt = stmt
	}

	if stmt, err := db.Prepare("INSERT INTO test_results (pass_id,raw_score,grade,level) VALUES($1,$2,$3,$4)"); err != nil {
		log.Fatal(err)
	} else {
		testResultStmt = stmt
	}

    if stmt, err := db.Prepare("UPDATE test_durations SET finish = $1 WHERE pass_id = $2"); err != nil {
		log.Fatal(err)
	} else {
		testFinishStmt = stmt
	}
}

func CreateSessionAndPass(v *models.SetTLParams) error {

	now := time.Now().UnixMilli()

	if _, err := db.Exec("INSERT INTO sessions (id, ip_address, started, browser_locale, referrer) values($1, $2, $3, $4, $5)",
				v.SessionId,
				v.IPAddress,
				now,
				v.BrowserLocale,
				v.Referrer); err != nil {
		log.Println(err)
		return err
	}

	if err := CreatePass(v); err != nil {
		log.Println(err)
		return err
	}

	return nil
}

func CreatePass(v *models.SetTLParams) error {

	now := time.Now().UnixMilli()

	if _, err := db.Exec("INSERT INTO passes (id, session_id, al, tl, skill, started) values($1, $2, $3, $4, $5, $6)",
				v.PassId,
				v.SessionId,
				v.Al,
				v.Tl,
				v.Skill,
				now); err != nil {

		log.Println(err)
		return err
	}

	return nil
}

func LogTestStart(passId *string, bookletId *int, bookletLength *int) {

	if _, err := db.Exec("INSERT INTO test_durations (pass_id,start) VALUES($1,$2)", passId, time.Now().UnixMilli()); err != nil {
		log.Printf("Failed to log test start time: %w\n", err)
	}

	if _, err := db.Exec("INSERT INTO pass_booklet (pass_id,booklet_id, length) VALUES($1,$2,$3)", passId, bookletId, bookletLength); err != nil {
		log.Printf("Failed to store pass_booklet: %w\n", err)
	}
}

func LogSingleIdResponse(passId string, item *models.ScoredItem) {

	if _, err := singleItemResponseStmt.Exec(passId, item.BasketId, item.Item.Id, item.ResponseId, item.Score, item.Correct, item.PositionInTest); err != nil {
		log.Printf("Failed to log single id response: %w\n", err)
	}
}

func LogMultipleTextualResponses(passId string, items []*models.ScoredItem) {

	basketId := items[len(items) - 1].BasketId

	for _, item := range items {
		if _, err := multipleItemResponseStmt.Exec(passId, basketId, item.Item.Id, item.ResponseText, item.Score, item.Correct, item.PositionInTest); err != nil {
		  log.Printf("Failed to log textual response: %w\n", err)
		}
	}
}

func LogMultipleIdResponses(passId string, items []*models.ScoredItem) {

	basketId := items[len(items) - 1].BasketId

	for _, item := range items {
		if _, err := multipleItemResponseStmt.Exec(passId, basketId, item.Item.Id, item.ResponseId, item.Score, item.Correct, item.PositionInTest); err != nil {
		  log.Printf("Failed to log id response: %w\n", err)
		}
	}
}

func LogBasket(passId string, basketId int, basketNumber int) {

    log.Printf("logBasket(%v, %d, %d)\n", passId, basketId, basketNumber)

	if _, err := basketStmt.Exec(passId, basketId, basketNumber); err != nil {
  		log.Printf("Failed to log basket: %w\n", err)
	}
}

func LogTestResult(dialangSession *models.DialangSession) {

    if _, err := testResultStmt.Exec(dialangSession.PassId, dialangSession.ItemRawScore, dialangSession.ItemGrade, dialangSession.ItemLevel); err != nil {
      log.Printf("Failed to log test result: %w\n", err)
    }
}

func LogTestFinish(passId string) {

    if _, err := testFinishStmt.Exec(time.Now().Unix(), passId); err != nil {
      log.Printf("Failed to log finish: %w\n", err)
    }
}


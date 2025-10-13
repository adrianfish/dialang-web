package datacapture

import (
	"log"
	"context"
	"os"
	"database/sql"
	"time"
	"net/mail"
	"net/http"

	"github.com/dialangproject/web/models"
	_ "github.com/lib/pq"
)

var db *sql.DB
var singleItemResponseStmt *sql.Stmt
var multipleItemResponseStmt *sql.Stmt
var basketStmt *sql.Stmt
var testResultStmt *sql.Stmt
var testFinishStmt *sql.Stmt
var questionnaireStmt *sql.Stmt
var vsptResponseStmt *sql.Stmt
var vsptScoresStmt *sql.Stmt
var saResponsesStmt *sql.Stmt
var saScoresStmt *sql.Stmt

func init() {

	dbHost := os.Getenv("DIALANG_DB_HOST")
	if dbHost == "" {
		dbHost = "dialang-datacapture-1"
	}

	dbUser := os.Getenv("POSTGRES_USER")
	dbPassword := os.Getenv("POSTGRES_PASSWORD")

	log.Printf("Connecting to dialang-data-capture database at %v\n", dbHost)

	//pw := "e785598fffccc098afda8eb6e42494e5"
	connStr := "postgres://" + dbUser + ":" + dbPassword + "@" + dbHost + "/dialang-data-capture?sslmode=disable"
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

	if stmt, err := db.Prepare("INSERT INTO questionnaire VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)"); err != nil {
		log.Fatal(err)
	} else {
		questionnaireStmt = stmt
	}

	if stmt, err := db.Prepare("INSERT INTO vsp_test_responses (pass_id,word_id,response) VALUES($1,$2,$3)"); err != nil {
		log.Fatal(err)
	} else {
		vsptResponseStmt = stmt
	}

	if stmt, err := db.Prepare("INSERT INTO vsp_test_scores (pass_id,z_score,meara_score,level) VALUES($1,$2,$3,$4)"); err != nil {
		log.Fatal(err)
	} else {
		vsptScoresStmt = stmt
	}

    if stmt, err := db.Prepare("INSERT INTO sa_responses (pass_id,statement_id,response) VALUES($1,$2,$3)"); err != nil {
		log.Fatal(err)
	} else {
		saResponsesStmt = stmt
	}

	if stmt, err := db.Prepare("INSERT INTO sa_scores (pass_id,ppe,level) VALUES($1,$2,$3)"); err != nil {
		log.Fatal(err)
	} else {
		saScoresStmt = stmt
	}
}

func CreateSessionAndPass(v *models.SetTLParams) error {

	now := time.Now().Unix()

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

	now := time.Now().Unix()

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

	if _, err := db.Exec("INSERT INTO test_durations (pass_id,start) VALUES($1,$2)", passId, time.Now().Unix()); err != nil {
		log.Printf("Failed to log test start time: %s\n", err)
	}

	if _, err := db.Exec("INSERT INTO pass_booklet (pass_id,booklet_id, length) VALUES($1,$2,$3)", passId, bookletId, bookletLength); err != nil {
		log.Printf("Failed to store pass_booklet: %s\n", err)
	}
}

func LogVSPTResponses(dialangSession *models.DialangSession, responses map[string]bool) {

	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		log.Printf("Failed to begin vspt responses transaction: %s\n", err)
		return
	}

    for word, answer := range responses {
		if _, err := tx.Stmt(vsptResponseStmt).Exec(dialangSession.PassId, word, answer); err != nil {
			log.Printf("Failed to log vspt word response: %s\n", err)
			tx.Rollback()
			return
       	}
	}

	if err := tx.Commit(); err != nil {
		log.Printf("Failed to commit vspt responses transaction: %s\n", err)
	}
}

func LogVSPTScores(dialangSession *models.DialangSession) {

	if _, err := vsptScoresStmt.Exec(dialangSession.PassId, dialangSession.VsptZScore, dialangSession.VsptMearaScore, dialangSession.VsptLevel); err != nil {
		log.Printf("Failed to log vspt scores: %s\n", err)
	}
}

func LogSAResponses(dialangSession *models.DialangSession, responses map[string]bool) {

	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		log.Printf("Failed to begin sa responses transaction: %s\n", err)
		return
	}

	for sId, answer := range responses {
		if _, err := tx.Stmt(saResponsesStmt).Exec(dialangSession.PassId, sId, answer); err != nil {
			log.Printf("Failed to log sa response: %s\n", err)
			tx.Rollback()
			return
       	}
	}

    if err := tx.Commit(); err != nil {
      log.Printf("Failed to commit sa responses transaction: %s\n", err)
    }
}

func LogSAScores(dialangSession *models.DialangSession) {

	if _, err := saScoresStmt.Exec(dialangSession.PassId, dialangSession.SaPPE, dialangSession.SaLevel); err != nil {
		log.Printf("Failed to log sa scores: %s\n", err)
	}
}

func LogSingleIdResponse(passId string, item *models.ScoredItem) {

	if _, err := singleItemResponseStmt.Exec(passId, item.BasketId, item.Item.Id, item.ResponseId, item.Score, item.Correct, item.PositionInTest); err != nil {
		log.Printf("Failed to log single id response: %s\n", err)
	}
}

func LogMultipleTextualResponses(passId string, items []*models.ScoredItem) {

	basketId := items[len(items) - 1].BasketId

	for _, item := range items {
		if _, err := multipleItemResponseStmt.Exec(passId, basketId, item.Item.Id, item.ResponseText, item.Score, item.Correct, item.PositionInTest); err != nil {
		  log.Printf("Failed to log textual response: %s\n", err)
		}
	}
}

func LogMultipleIdResponses(passId string, items []*models.ScoredItem) {

	basketId := items[len(items) - 1].BasketId

	for _, item := range items {
		if _, err := multipleItemResponseStmt.Exec(passId, basketId, item.Item.Id, item.ResponseId, item.Score, item.Correct, item.PositionInTest); err != nil {
		  log.Printf("Failed to log id response: %s\n", err)
		}
	}
}

func LogBasket(passId string, basketId int, basketNumber int) {

    log.Printf("logBasket(%v, %d, %d)\n", passId, basketId, basketNumber)

	if _, err := basketStmt.Exec(passId, basketId, basketNumber); err != nil {
  		log.Printf("Failed to log basket: %s\n", err)
	}
}

func LogTestResult(dialangSession *models.DialangSession) {

    if _, err := testResultStmt.Exec(dialangSession.PassId, dialangSession.ItemRawScore, dialangSession.ItemGrade, dialangSession.ItemLevel); err != nil {
      log.Printf("Failed to log test result: %s\n", err)
    }
}

func LogTestFinish(passId string) {

    if _, err := testFinishStmt.Exec(time.Now().Unix(), passId); err != nil {
      log.Printf("Failed to log finish: %s\n", err)
    }
}

func StoreQuestionnaire(sessionId string, r *http.Request) {

    ageGroup := r.FormValue("agegroup")
    gender := r.FormValue("gender")
    otherGender := r.FormValue("othergender")
    firstLanguage := r.FormValue("firstlanguage")
    nationality := r.FormValue("nationality")
    institution := r.FormValue("institution")
    reason := r.FormValue("reason")
    accuracy := r.FormValue("accuracy")
    comments := r.FormValue("comments")
    email := r.FormValue("email")
	if email != "" {
		if _, err := mail.ParseAddress(email); err != nil {
          log.Println(email + " is not a valid email. Setting to \"\"")
          email = ""
        }
	}

    log.Println("ageGroup: " + ageGroup)
    log.Println("gender: " + gender)
    log.Println("otherGender: " + otherGender)
    log.Println("firstLanguage: " + firstLanguage)
    log.Println("nationality: " + nationality)
    log.Println("institution: " + institution)
    log.Println("reason: " + reason)
    log.Println("accuracy: " + accuracy)
    log.Println("comments: " + comments)
    log.Println("email: " + email)

	if _, err := questionnaireStmt.Exec(sessionId, ageGroup, gender, otherGender, firstLanguage, nationality, institution, reason, accuracy, comments, email); err != nil {
		log.Printf("Failed to store questionnaire: %s\n", err)
    }
}


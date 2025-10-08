package data

import (
	"encoding/csv"
	"io"
	"log"
	"os"
	"slices"
	"strings"
	"strconv"

	"github.com/dialangproject/web/models"
)

var VSPTWords map[string][]models.VSPTWord
var VSPTBands map[string][]models.VSPTBand
var SAWeights map[string]map[string]int
var SAGrades []models.SAGrade
var PreestWeights map[string]models.PreestWeight
var PreestAssignments map[string][]models.PreestAssignment
var BookletLengths map[int]int
var BookletBaskets map[int][]int

func init() {

	cacheVSPTWords()
	cacheVSPTBands()
	cacheSAWeights()
	cacheSAGrades()
	cachePreestWeights()
	cachePreestAssignments()
	cacheBookletLengths()
	cacheBookletBaskets()
}

func cacheVSPTWords() {

	f, err := os.Open("data-files/vspt-words.csv")
	if err != nil {
		log.Fatal(err)
	}

	reader := csv.NewReader(f)

	// Dump the header line
	if _, err := reader.Read(); err != nil {
		log.Fatal(err)
	}

	VSPTWords = map[string][]models.VSPTWord{}

	for {
		r, err := reader.Read()
		if err == io.EOF {
			break;
		}

		locale := r[0]
		wordId := r[1]
		word := r[2]
		valid, err := strconv.Atoi(r[3])
		weight, err := strconv.Atoi(r[4])
		vsptWord := models.VSPTWord{wordId, word, valid, weight}

		words, ok := VSPTWords[locale]
		if !ok {
			VSPTWords[locale] = []models.VSPTWord{vsptWord}
		} else {
			VSPTWords[locale] = append(words, vsptWord)
		}
	}
}

func cacheVSPTBands() {

	f, err := os.Open("data-files/vspt-bands.csv")
	if err != nil {
		log.Fatal(err)
	}

	reader := csv.NewReader(f)

	// Dump the header line
	if _, err := reader.Read(); err != nil {
		log.Fatal(err)
	}

	VSPTBands = map[string][]models.VSPTBand{}
	for {
		r, err := reader.Read()
		if err == io.EOF {
			break;
		}

		low, err := strconv.Atoi(r[2])
		if err != nil {
			log.Fatal(err)
		}

		high, err := strconv.Atoi(r[3])
		if err != nil {
			log.Fatal(err)
		}

		band := models.VSPTBand{r[0], r[1], low, high}

		var bands, ok = VSPTBands[r[0]]
		if !ok {
			VSPTBands[r[0]] = []models.VSPTBand{band}
		} else {
			VSPTBands[r[0]] = append(bands, band)
		}
	}
}

func cacheSAWeights() {

	f, err := os.Open("data-files/sa-weights.csv")
	if err != nil {
		log.Fatal(err)
	}

	reader := csv.NewReader(f)

	// Dump the header line
	if _, err := reader.Read(); err != nil {
		log.Fatal(err)
	}

	SAWeights = map[string]map[string]int{}

	for {
		r, err := reader.Read()
		if err == io.EOF {
			break
		}

		skill := r[0]
		wid := r[1]
		weight, err := strconv.Atoi(r[2])
		if err != nil {
			log.Fatal(err)
		}

		_, ok := SAWeights[skill]
		if !ok {
			SAWeights[skill] = map[string]int{wid: weight}
		} else {
			SAWeights[skill][wid] = weight
		}
	}
}

func cacheSAGrades() {

	f, err := os.Open("data-files/sa-grading.csv")
	if err != nil {
		log.Fatal(err)
	}

	reader := csv.NewReader(f)

	// Dump the header line
	if _, err := reader.Read(); err != nil {
		log.Fatal(err)
	}

  	SAGrades = []models.SAGrade{}

	for {
		r, err := reader.Read()
		if err == io.EOF {
			break;
		}

		skill := r[0]
		rsc, err := strconv.Atoi(r[1])
		ppe, err := strconv.ParseFloat(r[2], 32)
		se, err := strconv.ParseFloat(r[3], 32)
		grade, err := strconv.Atoi(r[4])

		SAGrades = append(SAGrades, models.SAGrade{skill, rsc, ppe, se, grade})
	}
}

func cachePreestWeights() {

	f, err := os.Open("data-files/preest-weights.csv")
	if err != nil {
		log.Fatal(err)
	}

	reader := csv.NewReader(f)

	// Dump the header line
	if _, err := reader.Read(); err != nil {
		log.Fatal(err)
	}

	PreestWeights = map[string]models.PreestWeight{}

	for {
		r, err := reader.Read()
		if err == io.EOF {
			break;
		}

		key := r[0]
		sa, err := strconv.ParseFloat(r[1], 32)
		vspt, err := strconv.ParseFloat(r[2], 32)
		coe, err := strconv.ParseFloat(r[3], 32)
		weight := models.PreestWeight{sa, vspt, coe}

    	PreestWeights[key] = weight
	}
}


func cachePreestAssignments() {

	f, err := os.Open("data-files/preest-assignments.csv")
	if err != nil {
		log.Fatal(err)
	}

	reader := csv.NewReader(f)

	// Dump the header line
	if _, err := reader.Read(); err != nil {
		log.Fatal(err)
	}

	PreestAssignments = map[string][]models.PreestAssignment{}

	for {
		r, err := reader.Read()
		if err == io.EOF {
			break;
		}

		pe, err := strconv.ParseFloat(r[1], 32)
		bookletId, err := strconv.Atoi(r[2])
		assignment := models.PreestAssignment{pe, bookletId}

		key := r[0]

		assignments, ok := PreestAssignments[key]
		if ok {
			PreestAssignments[key] = append(assignments, assignment)
		} else {
			PreestAssignments[key] = []models.PreestAssignment{assignment}
		}
	}

	for k, a := range PreestAssignments {
		slices.SortFunc(a, func(pa1, pa2 models.PreestAssignment) int { return int(pa1.Pe - pa2.Pe) })
		PreestAssignments[k] = a
	}
}

func cacheBookletLengths() {

	f, err := os.Open("data-files/booklet-lengths.csv")
	if err != nil {
		log.Fatal(err)
	}

	reader := csv.NewReader(f)

	// Dump the header line
	if _, err := reader.Read(); err != nil {
		log.Fatal(err)
	}

	BookletLengths = map[int]int{}

	for {
		r, err := reader.Read()
		if err == io.EOF {
			break;
		}

		bookletId, err := strconv.Atoi(r[0])
		length, err := strconv.Atoi(r[1])
		BookletLengths[bookletId] = length
	}
}

func cacheBookletBaskets() {

	f, err := os.Open("data-files/booklet-baskets.csv")
	if err != nil {
		log.Fatal(err)
	}

	reader := csv.NewReader(f)

	// Dump the header line
	if _, err := reader.Read(); err != nil {
		log.Fatal(err)
	}

	BookletBaskets = map[int][]int{}

	for {
		r, err := reader.Read()
		if err == io.EOF {
			break;
		}

		bookletId, err := strconv.Atoi(r[0])
		basketIdStrings := strings.Split(r[1], ",")
		basketIds := make([]int, 0, len(basketIdStrings))

		for _, basketIdString := range basketIdStrings {
			basketId, _ := strconv.Atoi(basketIdString)
			basketIds = append(basketIds, basketId)
		}

		BookletBaskets[bookletId] = basketIds
	}
}

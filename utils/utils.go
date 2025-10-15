package utils

import (
	"github.com/google/uuid"
	"log"
)

func GenerateUUID() string {

	id, err := uuid.NewV7()
	if err != nil {
		log.Println(err)
		return ""
	}

	return id.String()
}

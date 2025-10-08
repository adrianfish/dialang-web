package session

import (
	"time"
	"github.com/alexedwards/scs/v2"
)

var SessionManager *scs.SessionManager

func init()  {

	SessionManager = scs.New()
	SessionManager.Lifetime = 4 * time.Hour
}


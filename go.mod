module github.com/dialangproject/web

go 1.25.0

replace github.com/dialangproject/common => ../common

require (
	github.com/alexedwards/scs/v2 v2.9.0
	github.com/dialangproject/common v0.0.0-00010101000000-000000000000
	github.com/google/uuid v1.6.0
	github.com/lib/pq v1.10.9
)

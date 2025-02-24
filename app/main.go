package main

import (
	"MarkDownReader/api/server"
	db "MarkDownReader/database"
)

func main() {
	db.Init()
	s := server.APIServer{Address: ":8080"}
	err := s.Run()
	if err != nil {
		panic(err)
	}
}

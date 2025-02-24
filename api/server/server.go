package server

import (
	"MarkDownReader/api/handlers"
	"github.com/gin-gonic/gin"
	"log"
)

type APIServer struct {
	Address string `json:"address"`
}

func (s *APIServer) Run() error {
	router := gin.Default()
	router.POST("/signup", handlers.SignUp)
	router.POST("/login", handlers.Login)
	router.POST("/refresh", handlers.RefreshToken)
	err := router.Run(s.Address)
	if err != nil {
		log.Fatal(err)
		return err
	}
	return nil
}

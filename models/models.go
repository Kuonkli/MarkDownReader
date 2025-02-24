package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `gorm:"unique;not null"`
	Password string `gorm:"not null"`
	Nickname string
}

type MarkdownFile struct {
	gorm.Model
	Filename string `gorm:"not null"`
	Content  string `gorm:"type:text;not null"`
	UserID   uint   `gorm:"not null"`
	User     User   `gorm:"foreignKey:UserID"`
}

type Comment struct {
	gorm.Model
	Type           string       `gorm:"not null"`
	Content        string       `gorm:"type:text;not null"`
	UserID         uint         `gorm:"not null"`
	User           User         `gorm:"foreignKey:UserID"`
	MarkdownFileID uint         `gorm:"not null"`
	MarkdownFile   MarkdownFile `gorm:"foreignKey:MarkdownFileID"`
	Position       int          `gorm:"not null"`
}

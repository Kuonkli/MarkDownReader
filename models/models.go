package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `gorm:"size:200;unique;not null"`
	Password string `gorm:"not null"`
	Nickname string `gorm:"size:100;not null"`
}

type MarkdownFile struct {
	gorm.Model
	Filename string `gorm:"size:100;not null"`
	FileURL  string `gorm:"type:text;not null"`
	UserID   uint   `gorm:"not null"`
	User     User   `gorm:"foreignKey:UserID" json:"-"`
}

type Comment struct {
	gorm.Model
	Type           string       `gorm:"not null"`
	Content        string       `gorm:"type:text;not null"`
	UserID         uint         `gorm:"not null"`
	User           User         `gorm:"foreignKey:UserID" json:"-"`
	MarkdownFileID uint         `gorm:"not null"`
	MarkdownFile   MarkdownFile `gorm:"foreignKey:MarkdownFileID" json:"-"`
	Position       int          `gorm:"not null"`
}

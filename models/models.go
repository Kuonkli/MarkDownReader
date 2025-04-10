package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email    string `gorm:"size:200;unique;not null" json:"email"`
	Password string `gorm:"not null" json:"password"`
	Nickname string `gorm:"size:100;not null" json:"nickname"`
}

type MarkdownFile struct {
	gorm.Model
	Filename string `gorm:"size:100;not null" json:"filename"`
	FileURL  string `gorm:"type:text;not null" json:"file_url"`
	UserID   uint   `gorm:"not null" json:"user_id"`
	User     *User  `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

type Comment struct {
	gorm.Model
	Type           string        `gorm:"type:varchar;not null" json:"type"`
	Title          string        `gorm:"type:varchar;not null" json:"title"`
	Content        string        `gorm:"type:text;not null" json:"content"`
	UserID         uint          `gorm:"not null" json:"user_id"`
	User           *User         `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	MarkdownFileID uint          `gorm:"not null" json:"markdown_file_id"`
	MarkdownFile   *MarkdownFile `gorm:"foreignKey:MarkdownFileID;constraint:OnDelete:CASCADE" json:"markdown_file,omitempty"`
	PositionX      int           `gorm:"column:position_x;not null" json:"position_x"`
	PositionY      int           `gorm:"column:position_y;not null" json:"position_y"`
}

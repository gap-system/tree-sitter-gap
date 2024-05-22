package tree_sitter_GAP_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-GAP"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_GAP.Language())
	if language == nil {
		t.Errorf("Error loading Gap grammar")
	}
}

package tree_sitter_gap_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/gap-system/tree-sitter-gap"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_gap.Language())
	if language == nil {
		t.Errorf("Error loading Gap grammar")
	}
}

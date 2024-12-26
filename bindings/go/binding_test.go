package tree_sitter_gap_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_gap "github.com/gap-system/tree-sitter-gap/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_gap.Language())
	if language == nil {
		t.Errorf("Error loading gap grammar")
	}
}

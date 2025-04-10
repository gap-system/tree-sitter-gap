CORPUS_VERSION=v4.14.0
GRAMMAR_VERSION=v0.3.1
EXAMPLES_DIR=./examples
RELEASE_PREFIX=https://github.com/gap-system/tree-sitter-gap/releases/download

.PHONY: compile format corpus test_quick test_gap test_pkg test_all clean distclean benchmark

compile: grammar.js src/scanner.c
	tree-sitter generate --no-bindings

format:
	npm run format

corpus:
	./etc/extract_corpus.sh -v $(CORPUS_VERSION) temp_extract_corpus
	mv ./temp_extract_corpus/corpus_gap.tar.gz $(EXAMPLES_DIR)/corpus_gap_$(CORPUS_VERSION).tar.gz
	mv ./temp_extract_corpus/corpus_pkg.tar.gz $(EXAMPLES_DIR)/corpus_pkg_$(CORPUS_VERSION).tar.gz

$(EXAMPLES_DIR)/corpus_gap_$(CORPUS_VERSION).tar.gz:
	curl -L $(RELEASE_PREFIX)/$(GRAMMAR_VERSION)/corpus_gap_$(CORPUS_VERSION).tar.gz > $(EXAMPLES_DIR)/corpus_gap_$(CORPUS_VERSION).tar.gz

$(EXAMPLES_DIR)/corpus_pkg_$(CORPUS_VERSION).tar.gz:
	curl -L $(RELEASE_PREFIX)/$(GRAMMAR_VERSION)/corpus_pkg_$(CORPUS_VERSION).tar.gz > $(EXAMPLES_DIR)/corpus_pkg_$(CORPUS_VERSION).tar.gz

$(EXAMPLES_DIR)/temp_corpus_gap_$(CORPUS_VERSION): $(EXAMPLES_DIR)/corpus_gap_$(CORPUS_VERSION).tar.gz
	mkdir -p $(EXAMPLES_DIR)/temp_corpus_gap_$(CORPUS_VERSION)
	tar -xzf $(EXAMPLES_DIR)/corpus_gap_$(CORPUS_VERSION).tar.gz -C $(EXAMPLES_DIR)/temp_corpus_gap_$(CORPUS_VERSION)

$(EXAMPLES_DIR)/temp_corpus_pkg_$(CORPUS_VERSION): $(EXAMPLES_DIR)/corpus_pkg_$(CORPUS_VERSION).tar.gz
	mkdir -p $(EXAMPLES_DIR)/temp_corpus_pkg_$(CORPUS_VERSION)
	tar -xzf $(EXAMPLES_DIR)/corpus_pkg_$(CORPUS_VERSION).tar.gz -C $(EXAMPLES_DIR)/temp_corpus_pkg_$(CORPUS_VERSION)

test_quick: compile
	tree-sitter test

test_gap: $(EXAMPLES_DIR)/temp_corpus_gap_$(CORPUS_VERSION) compile
	tree-sitter parse '$(EXAMPLES_DIR)/temp_corpus_gap_$(CORPUS_VERSION)/*.g*' --quiet --stat

test_pkg: $(EXAMPLES_DIR)/temp_corpus_pkg_$(CORPUS_VERSION) compile
	tree-sitter parse '$(EXAMPLES_DIR)/temp_corpus_pkg_$(CORPUS_VERSION)/*.g*' --quiet --stat

test_all: test_quick $(EXAMPLES_DIR)/temp_corpus_gap_$(CORPUS_VERSION) $(EXAMPLES_DIR)/temp_corpus_pkg_$(CORPUS_VERSION)
	tree-sitter parse '$(EXAMPLES_DIR)/temp_corpus_*/*.g*' --quiet --stat

benchmark: compile $(EXAMPLES_DIR)/temp_corpus_gap_$(CORPUS_VERSION) $(EXAMPLES_DIR)/temp_corpus_pkg_$(CORPUS_VERSION)
	runtimes=$$(tree-sitter parse './examples/temp_corpus_*/*.g*' --quiet --time | pv -s2500k | sort -k2 -n -r --parallel=8 -);\
	echo "Top 20 slowest runtimes:";\
	echo "$$runtimes" | head -n20;\
	echo "$$runtimes" \
		| awk '{print $$2}' \
		| gnuplot -p -e 'set logscale xy 10; plot "/dev/stdin" using (column(0)+1):1 title "Runtime"'

image-example-parse.svg: grammar.js src/scanner.c ./etc/visualize_parse_tree.py
	echo 'G := Group((1, 2, 3), (1, 2)(3, 4)); IsNormal(SymmetricGroup(4), G);' | ./etc/visualize_parse_tree.py -o ./image-example-parse.svg

clean:
	rm -rf $(EXAMPLES_DIR)/temp_*

distclean: clean
	rm -f $(EXAMPLES_DIR)/corpus_gap_*.tar.gz
	rm -f $(EXAMPLES_DIR)/corpus_pkg_*.tar.gz
	rm -rf ./temp_*

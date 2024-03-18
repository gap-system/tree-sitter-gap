GAP_DIR=temp_gap_for_tests
EXAMPLES_DIR=./examples
TST_TO_G=./examples/tst_to_g.py

# Recursively get files matching given extension regex from input directory,
# flatten and copy to output directory.
define get_files
	$(eval $@_REGEX = $(1))
	$(eval $@_INPUT_DIRECTORY = $(2))
	$(eval $@_OUTPUT_DIRECTORY = $(3))
	find ${$@_INPUT_DIRECTORY} -type f -regextype sed -regex ${$@_REGEX} -exec sh -c 'new=${$@_OUTPUT_DIRECTORY}/temp-$$(echo "{}" | tr "/" "-" | tr " " "_"); cp "{}" "$$new"' \;
endef

.PHONY: clean create_gap_tests create_pkg_tests test_gap test_pkg test_all

$(GAP_DIR):
	git clone --depth=1 https://github.com/gap-system/gap $(GAP_DIR)

$(GAP_DIR)/pkg: $(GAP_DIR)
	cd $(GAP_DIR) && ./autogen.sh && ./configure
	cd $(GAP_DIR) && make bootstrap-pkg-full

create_gap_tests: $(GAP_DIR)
	mkdir -p $(EXAMPLES_DIR)/temp_gap
	@$(call get_files, ".*\.\(gd\|gi\|g\)", $(GAP_DIR)/grp, $(EXAMPLES_DIR)/temp_gap)
	@$(call get_files, ".*\.\(gd\|gi\|g\)", $(GAP_DIR)/lib, $(EXAMPLES_DIR)/temp_gap)
	@$(call get_files, ".*\.\(gd\|gi\|g\)", $(GAP_DIR)/tst, $(EXAMPLES_DIR)/temp_gap)
	mkdir -p $(EXAMPLES_DIR)/temp_tst
	@$(call get_files, ".*\.\(tst\)", $(GAP_DIR)/grp, $(EXAMPLES_DIR)/temp_tst)
	@$(call get_files, ".*\.\(tst\)", $(GAP_DIR)/lib, $(EXAMPLES_DIR)/temp_tst)
	@$(call get_files, ".*\.\(tst\)", $(GAP_DIR)/tst, $(EXAMPLES_DIR)/temp_tst)
	for tst_file in $(EXAMPLES_DIR)/temp_tst/*.tst; do \
		python3 $(TST_TO_G) $${tst_file}; \
	done

create_pkg_tests: $(GAP_DIR)/pkg
	mkdir -p $(EXAMPLES_DIR)/temp_pkg
	@$(call get_files, ".*\.\(gd\|gi\|g\)", $(GAP_DIR)/pkg, $(EXAMPLES_DIR)/temp_pkg)
	mkdir -p $(EXAMPLES_DIR)/temp_tst
	@$(call get_files, ".*\.\(tst\)", $(GAP_DIR)/pkg, $(EXAMPLES_DIR)/temp_tst)
	for tst_file in $(EXAMPLES_DIR)/temp_tst/*.tst; do \
		python3 $(TST_TO_G) $${tst_file}; \
	done

test_gap: create_gap_tests
	tree-sitter parse '$(EXAMPLES_DIR)/temp_gap/*.g*' --quiet --stat

test_pkg: create_pkg_tests
	tree-sitter parse '$(EXAMPLES_DIR)/temp_pkg/*.g*' --quiet --stat

test_tst: create_gap_tests create_pkg_tests
	tree-sitter parse '$(EXAMPLES_DIR)/temp_tst/*.g*' --quiet --stat

test_all: create_gap_tests create_pkg_tests
	tree-sitter parse '$(EXAMPLES_DIR)/**/*.g*' --quiet --stat

clean:
	rm -rf $(EXAMPLES_DIR)/temp_gap
	rm -rf $(EXAMPLES_DIR)/temp_pkg
	rm -rf $(EXAMPLES_DIR)/temp_tst

distclean: clean
	rm -rf ./$(GAP_DIR)

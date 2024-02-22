GAP_DIR=temp_gap_for_tests
EXAMPLES_DIR=./examples

# Recursively get files matching given extension regex from input directory,
# flatten and copy to output directory.
define get_files
	$(eval $@_REGEX = $(1))
	$(eval $@_INPUT_DIRECTORY = $(2))
	$(eval $@_OUTPUT_DIRECTORY = $(3))
	find ${$@_INPUT_DIRECTORY} -type f -regextype sed -regex ${$@_REGEX} -exec sh -c 'new=${$@_OUTPUT_DIRECTORY}/temp-$$(echo "{}" | tr "/" "-" | tr " " "_"); cp "{}" "$$new"' \;
endef

.PHONY: clean create_gap_tests create_pkg_tests test_g test_tst test_all

$(GAP_DIR):
	git clone --depth=1 https://github.com/gap-system/gap $(GAP_DIR)

$(GAP_DIR)/pkg: $(GAP_DIR)
	cd $(GAP_DIR) && ./autogen.sh && ./configure
	cd $(GAP_DIR) && make bootstrap-pkg-full

create_gap_tests: $(GAP_DIR)
	mkdir -p $(EXAMPLES_DIR)/temp_gap
	@$(call get_files, ".*\.\(gd\|gi\|g\|tst\)", $(GAP_DIR)/grp, $(EXAMPLES_DIR)/temp_gap)
	@$(call get_files, ".*\.\(gd\|gi\|g\|tst\)", $(GAP_DIR)/lib, $(EXAMPLES_DIR)/temp_gap)
	@$(call get_files, ".*\.\(gd\|gi\|g\|tst\)", $(GAP_DIR)/tst, $(EXAMPLES_DIR)/temp_gap)

create_pkg_tests: $(GAP_DIR)/pkg
	mkdir -p $(EXAMPLES_DIR)/temp_pkg
	@$(call get_files, ".*\.\(gd\|gi\|g\|tst\)", $(GAP_DIR)/pkg, $(EXAMPLES_DIR)/temp_pkg)

test_g: create_gap_tests
	tree-sitter parse '$(EXAMPLES_DIR)/**/*.g*' --quiet --stat

test_tst: create_gap_tests
	tree-sitter parse '$(EXAMPLES_DIR)/**/*.tst' --quiet --stat

test_all: create_gap_tests
	tree-sitter parse '$(EXAMPLES_DIR)/**/.*' --quiet --stat

clean:
	rm -rf $(EXAMPLES_DIR)/temp_gap
	rm -rf $(EXAMPLES_DIR)/temp_pkg

distclean: clean
	rm -rf ./$(GAP_DIR)

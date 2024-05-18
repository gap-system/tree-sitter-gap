GAP_DIR=./temp_gap_for_tests
EXAMPLES_DIR=./examples
TST_TO_G=./etc/tst_to_g.py

# TODO: Move longer bits of code into separate shell scripts for ease of maintenance.

# Recursively get files matching given extension regex from input directory,
# flatten and copy to output directory.
define get_files
	$(eval $@_REGEX = $(1))
	$(eval $@_INPUT_DIRECTORY = $(2))
	$(eval $@_OUTPUT_DIRECTORY = $(3))
	find ${$@_INPUT_DIRECTORY} -type f -regextype sed -regex ${$@_REGEX} -exec sh -c 'new=${$@_OUTPUT_DIRECTORY}/$$(echo "{}" | tr "/" "-" | tr " " "_" | sed "s/\.-//"); cp "{}" "$$new"' \;
endef

.PHONY: clean test_gap test_pkg test_all format

$(GAP_DIR):
	if [ ! -d $(GAP_DIR) ]; then \
		git clone --depth=1 https://github.com/gap-system/gap $(GAP_DIR); \
	fi

$(GAP_DIR)/pkg: $(GAP_DIR)
	if [ ! -d $(GAP_DIR)/pkg ]; then \
		cd $(GAP_DIR) && ./autogen.sh && ./configure && make bootstrap-pkg-full; \
	fi

$(EXAMPLES_DIR)/temp_gap: $(GAP_DIR)
	mkdir -p $(EXAMPLES_DIR)/temp_gap
	$(foreach dir_name, grp lib tst, $(call get_files, ".*\.\(gd\|gi\|g\)", $(GAP_DIR)/$(dir_name), $(EXAMPLES_DIR)/temp_gap))

$(EXAMPLES_DIR)/temp_gap_tst: $(EXAMPLES_DIR)/temp_gap $(GAP_DIR) $(TST_TO_G)
	mkdir -p $(EXAMPLES_DIR)/temp_gap_tst
	$(foreach dir_name, grp lib tst, $(call get_files, ".*\.\(tst\)", $(GAP_DIR)/$(dir_name), $(EXAMPLES_DIR)/temp_gap_tst))
	for g_file in $(EXAMPLES_DIR)/temp_gap/*; do \
		if grep -Eq '^gap>|^GAP>' $${g_file}; then \
			g_file_filename=$$(basename $${g_file}); \
			mv $${g_file} $(EXAMPLES_DIR)/temp_gap_tst/$${g_file_filename%.*}_g.tst; \
		fi; \
	done
	for tst_file in $(EXAMPLES_DIR)/temp_gap_tst/*.tst; do \
		$(TST_TO_G) $${tst_file}; \
	done

$(EXAMPLES_DIR)/temp_pkg: $(GAP_DIR)/pkg
	mkdir -p $(EXAMPLES_DIR)/temp_pkg
	$(call get_files, ".*\.\(gd\|gi\|g\)", $(GAP_DIR)/pkg, $(EXAMPLES_DIR)/temp_pkg)

$(EXAMPLES_DIR)/temp_pkg_tst: $(EXAMPLES_DIR)/temp_pkg $(GAP_DIR)/pkg $(TST_TO_G)
	mkdir -p $(EXAMPLES_DIR)/temp_pkg_tst
	$(call get_files, ".*\.\(tst\)", $(GAP_DIR)/pkg, $(EXAMPLES_DIR)/temp_pkg_tst)
	for g_file in $(EXAMPLES_DIR)/temp_pkg/*; do \
		if grep -Eq '^gap>|^GAP>' $${g_file}; then \
			g_file_filename=$$(basename $${g_file}); \
			mv $${g_file} $(EXAMPLES_DIR)/temp_pkg_tst/$${g_file_filename%.*}_g.tst; \
		fi; \
	done
	for tst_file in $(EXAMPLES_DIR)/temp_pkg_tst/*.tst; do \
		$(TST_TO_G) $${tst_file}; \
	done

test_gap: $(EXAMPLES_DIR)/temp_gap $(EXAMPLES_DIR)/temp_gap_tst
	tree-sitter parse '$(EXAMPLES_DIR)/temp_gap*/*.g*' --quiet --stat

test_pkg: $(EXAMPLES_DIR)/temp_pkg $(EXAMPLES_DIR)/temp_pkg_tst
	tree-sitter parse '$(EXAMPLES_DIR)/temp_pkg*/*.g*' --quiet --stat

test_all: $(EXAMPLES_DIR)/temp_gap $(EXAMPLES_DIR)/temp_gap_tst $(EXAMPLES_DIR)/temp_pkg $(EXAMPLES_DIR)/temp_pkg_tst
	tree-sitter parse '$(EXAMPLES_DIR)/**/*.g*' --quiet --stat

format:
	prettier -w grammar.js

clean:
	rm -rf $(EXAMPLES_DIR)/temp_*

distclean: clean
	rm -rf $(GAP_DIR)

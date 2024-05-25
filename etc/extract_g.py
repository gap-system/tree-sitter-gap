#!/usr/bin/env python3
"""Quick, naive script to extract GAP code from a .tst file.

Additionally contains various fixup scripts for converting e.g. .g files that
are actually .tst files and files that are passed as input to `ReadAsFunction`.
"""

import argparse


def is_tst_file(lines: list[str]) -> bool:
    """Check if lines correspond to a `tst` file.

    To do so, check that the first non-comment line starts with a `gap>`
    prompt.
    """
    for line in lines:
        if len(line.strip()) != 0 and line[0] != "#":
            return line.lower().startswith("gap>")
    return False


def is_function_file(lines: list[str]) -> bool:
    """Check if lines correspond to a file read by `ReadAsFunction`.

    To do so, check that first non-comment line starts with `local` or that the
    last non-comment line starts with a `return` statement.

    Note
    ----
    This is a rather hacky method, and it will fail in some cases.
    """
    for line in lines:
        if len(line.strip()) != 0 and line[0] != "#":
            if line.lower().startswith("local"):
                return True
            break
    for line in reversed(lines):
        if len(line.strip()) != 0 and line[0] != "#":
            if line.strip().lower().startswith("return"):
                return True
            break
    return False


def extract_g_lines_from_tst_lines(lines: list[str]) -> list[str]:
    """Extract `g` lines from a `tst` files lines.

    Given a `tst` file split by lines, return the lines that correspond to the underlying `g` file.
    """
    result_cases = []
    syntax_error = []
    inside_case = False
    for idx, line in enumerate(lines):
        if (
            line.startswith("#@local")
            or line.startswith("#@if")
            or line.startswith("#@else")
            or line.startswith("#@fi")
            or line.startswith("#@exec")
        ):
            continue
        if not inside_case and line.startswith("#"):
            # For simplicity, treat each comment as a separate test case
            result_cases.append([idx])
            syntax_error.append(False)
        elif line.startswith("gap> "):
            result_cases.append([idx])
            syntax_error.append(False)
            inside_case = True
        elif line.startswith("> "):
            if not inside_case:
                raise RuntimeError(
                    "Malformed test file, line continuation outside test case!"
                )
            result_cases[-1].append(idx)
        elif len(line) > 0:
            # Check if the output indicates a syntax error
            if line.startswith("Syntax error:"):
                syntax_error[-1] = True
        elif inside_case and len(line) == 0:
            result_cases[-1].append(idx)
            inside_case = False

    result_lines = []
    for case, exclude in zip(result_cases, syntax_error):
        if exclude:
            continue
        for idx in case:
            line = lines[idx]
            if line.startswith("gap> "):
                line = line[len("gap> ") :]
            elif line.startswith("> "):
                line = line[len("> ") :]
            result_lines.append(line)
    return result_lines


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Extract or fixup GAP code from a .g or .tst file."
    )
    parser.add_argument(
        "in_file",
        type=str,
        help="Name of the file to process",
    )
    parser.add_argument(
        "-o",
        "--out_file",
        type=str,
        default=None,
        help="Name of the output file. If omitted, will overwrite a .g file in place, and append a .g to the filename of a .tst file.",
        required=False,
    )
    args = parser.parse_args()

    try:
        with open(args.in_file, "r") as in_file:
            text = in_file.read()
    except UnicodeDecodeError:
        with open(args.in_file, "r", encoding="ISO-8859-1") as in_file:
            text = in_file.read()

    lines = text.split("\n")
    if is_tst_file(lines):
        result_lines = extract_g_lines_from_tst_lines(lines)
    elif is_function_file(lines):
        result_lines = ["function()"]
        result_lines.extend(lines)
        result_lines.append("end;")
    else:
        result_lines = lines

    out_file_name = args.out_file
    if out_file_name is None:
        out_file_name = args.in_file
        if args.in_file.endswith(".tst"):
            out_file_name += ".g"

    with open(out_file_name, "w") as out_file:
        out_file.write("\n".join(result_lines))

#!/usr/bin/env python3
"""Quick, naive script to extract GAP code from .tst file."""
import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract GAP code from a .tst file.")
    parser.add_argument(
        "in_file",
        type=str,
        help="name of the file to process",
    )
    parser.add_argument(
        "-o",
        "--out_file",
        type=str,
        default=None,
        help="name of the output file, defaults to appending .g if omitted",
        required=False,
    )
    args = parser.parse_args()

    try:
        with open(args.in_file, "r") as in_file:
            text = in_file.read()
    except UnicodeDecodeError:
        with open(args.in_file, "r", encoding="ISO-8859-1") as in_file:
            text = in_file.read()

    result_cases = []
    syntax_error = []
    inside_case = False
    lines = text.split("\n")
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

    out_file_name = args.out_file
    if out_file_name is None:
        out_file_name = args.in_file + ".g"

    with open(out_file_name, "w") as out_file:
        for case, exclude in zip(result_cases, syntax_error):
            if exclude:
                continue
            for idx in case:
                line = lines[idx]
                if line.startswith("gap> "):
                    line = line[len("gap> ") :]
                elif line.startswith("> "):
                    line = line[len("> ") :]
                out_file.write(line)
                out_file.write("\n")

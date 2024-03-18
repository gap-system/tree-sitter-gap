#!/usr/bin/env python3
"""Quick, naive script to extract GAP code from .tst file."""
import argparse


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Exctract GAP code from a .tst file.")
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
        help="name of the output file, defaults to appending .g if ommited",
        required=False,
    )
    args = parser.parse_args()

    with open(args.in_file, "r") as in_file:
        text = in_file.read()

    result_lines = []
    ignore = False
    reading_input = False
    empty_line = False
    for line in text.split("\n"):
        if line.startswith("gap> "):
            ignore = False
            reading_input = True
            result_lines.append(line[len("gap> ") :])
        elif line.startswith("> ") and reading_input:
            result_lines.append(line[len("> ") :])
        elif reading_input:
            reading_input = False
            ignore = True
        elif ignore and len(line) == 0:
            empty_line = True
        elif ignore and empty_line and line[0] == "#":
            ignore = False
            empty_line = False
            result_lines.append("")
            result_lines.append(line)
        elif ignore and empty_line:
            empty_line = False
        elif not ignore:
            result_lines.append(line)

    out_file_name = args.out_file
    if out_file_name is None:
        out_file_name = args.in_file + ".g"

    with open(out_file_name, "w") as out_file:
        out_file.write("\n".join(result_lines))

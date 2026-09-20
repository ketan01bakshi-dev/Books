#!/usr/bin/env python3
"""Validates every book graph.json and subject/master.json against the schemas
in schema/. Run from the repo root: python scripts/validate_graphs.py
"""
import glob
import json
import sys
from pathlib import Path

import jsonschema
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parent.parent


def build_validator(schema_path):
    schema = json.loads((ROOT / schema_path).read_text())
    book_schema = json.loads((ROOT / "schema/book-graph.schema.json").read_text())
    master_schema = json.loads((ROOT / "schema/master-graph.schema.json").read_text())
    registry = Registry().with_resources([
        (book_schema["$id"], Resource.from_contents(book_schema)),
        (master_schema["$id"], Resource.from_contents(master_schema)),
    ])
    cls = jsonschema.validators.validator_for(schema)
    return cls(schema, registry=registry)


def main():
    book_validator = build_validator("schema/book-graph.schema.json")
    master_validator = build_validator("schema/master-graph.schema.json")

    failures = []

    for path in sorted(glob.glob(str(ROOT / "site/books/*/graph.json"))):
        data = json.loads(Path(path).read_text())
        errors = list(book_validator.iter_errors(data))
        if errors:
            failures.append((path, errors))
        else:
            print(f"OK  {path}")

    for path in sorted(glob.glob(str(ROOT / "site/subjects/*/master.json"))):
        data = json.loads(Path(path).read_text())
        errors = list(master_validator.iter_errors(data))
        if errors:
            failures.append((path, errors))
        else:
            print(f"OK  {path}")

    if failures:
        print("\nSCHEMA VALIDATION FAILED:")
        for path, errors in failures:
            print(f"\n{path}:")
            for e in errors:
                print(f"  - {'/'.join(str(p) for p in e.path)}: {e.message}")
        sys.exit(1)

    print(f"\nAll graphs valid.")


if __name__ == "__main__":
    main()

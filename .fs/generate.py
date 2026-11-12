#!/usr/bin/env python3
from pathlib import Path
import json
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class File:
    name: str
    extension: str
    size: int
    rel_path: str
    def to_json(self) -> dict:
        return {"name": self.name, "extension": self.extension, "size": self.size, "path": self.rel_path}


@dataclass(slots=True)
class Directory:
    name: str
    files: list[File]
    directories: list["Directory"]
    
    def to_json(self):
        json_info: dict[str, object] = {"name": self.name}
        json_info["files"] = [file.to_json() for file in self.files]
        json_info["directories"] = [directory.to_json() for directory in self.directories]
        return json_info


def scrape_files(core: Path) -> Directory:
    ignored_folders = [".fs", ".git", "fs-metadata.json"]
    root = Directory("/", [], [])

    for file in core.rglob("*"):
        if not file.is_file():
            continue

        if any(p.name in ignored_folders for p in file.parents) or file.name in ignored_folders:
            continue

        directory = root
        parts = file.relative_to(core).parts[:-1]
        for directory_name in parts:
            child = next(
                (item for item in directory.directories if item.name == directory_name),
                None,
            )
            if child is None:
                child = Directory(directory_name, [], [])
                directory.directories.append(child)
            directory = child

        directory.files.append(File(file.name, file.suffix, file.stat().st_size, str(file.relative_to(core))))

    return root

root = Path(__file__).parent.parent
files = scrape_files(root)



with open(root / "fs-metadata.json", "w") as f:
    json.dump(files.to_json(),f, indent=2)
#!/usr/bin/env python3
"""Stage itsPLK/ps5-webkit-autoloader v0.7+ into host/packed.

v0.7 replaced the two monolithic HTML bundles with a modular AppCache tree
and a separate installer ELF. The ESP32 serves that setup page. After the
cache fills, the page runs the exploit and hands the installer ELF to elfldr.
The installer creates the homescreen shortcut. The chip cannot add a manifest
attribute per request, so the manifest is a static file on /cache.html.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WEB = ROOT / "webkit-autoloader"
DEFAULT_OUT = ROOT / "host" / "packed"
INSTALLER = ROOT / "host" / "installer"


def run(cmd: list[str], cwd: Path, env: dict = None) -> None:
    print("+", " ".join(cmd), flush=True)
    subprocess.run(cmd, cwd=cwd, check=True, env=env)


def capture(cmd: list[str], cwd: Path) -> str:
    return subprocess.run(
        cmd, cwd=cwd, check=True, capture_output=True, text=True,
    ).stdout.strip()


def fetch(url: str, attempts: int = 5) -> bytes:
    last = None
    for i in range(attempts):
        req = urllib.request.Request(url, headers={
            "User-Agent": "ps5-webkit-autoloader-esp32",
            "Accept-Encoding": "gzip",
        })
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
                if resp.headers.get("Content-Encoding", "").lower() == "gzip":
                    data = gzip.decompress(data)
                return data
        except Exception as exc:
            last = exc
            time.sleep(1 + i)
    raise last


def read_base(web: Path) -> str:
    header = (web / "include" / "wkali.h").read_text(encoding="utf-8")
    import re
    match = re.search(r'#define\s+WKAL_VERSION\s+"([^"]+)"', header)
    if not match:
        raise SystemExit(f"WKAL_VERSION missing in {web / 'include' / 'wkali.h'}")
    return match.group(1)


def read_version(web: Path) -> tuple[str, str]:
    env = os.environ.copy()
    env.setdefault("BUILD_TYPE", "stable")
    printed = subprocess.run(
        [sys.executable, str(web / "tools" / "gen_version.py"), "--print"],
        cwd=web, check=True, capture_output=True, text=True, env=env,
    ).stdout.strip()
    return printed, read_base(web)


def build_time_of(web: Path) -> str:
    stamp = capture(["git", "-C", str(web), "log", "-1", "--format=%cI"], web)
    try:
        return datetime.fromisoformat(stamp).astimezone(timezone.utc).strftime(
            "%Y-%m-%d %H:%M:%S UTC")
    except ValueError:
        return stamp or "unknown"


def fill(text: str, version: str, build_time: str) -> str:
    return (text
            .replace("[[VERSION_PLACEHOLDER]]", version)
            .replace("[[APP_DIR_PLACEHOLDER]]", version)
            .replace("[[BUILD_TIME_PLACEHOLDER]]", build_time))


def prepare_tree(web: Path) -> None:
    run(["git", "submodule", "update", "--init",
         "third_party/ps5-elfldr",
         "third_party/ps5-unified-autoloader",
         "third_party/ps5-webkit-remote-loader"], cwd=web)
    for name in ("ps5-elfldr", "ps5-unified-autoloader"):
        run(["git", "fetch", "--tags", "--force", "--no-recurse-submodules"],
            cwd=web / "third_party" / name)
    if os.name == "nt":
        bash = Path(r"C:\Program Files\Git\bin\bash.exe")
        posix = "/" + web.drive[0].lower() + web.as_posix()[2:]
        py = Path(sys.executable)
        posix_py = "/" + py.drive[0].lower() + py.as_posix()[2:]
        run([
            str(bash), "-lc",
            "export PATH='/usr/bin:/bin:/mingw64/bin:$PATH'; "
            f"python3() {{ '{posix_py}' \"$@\"; }}; export -f python3; "
            f"cd '{posix}' && bash ./tools/download_deps.sh",
        ], cwd=web)
    else:
        run(["bash", "tools/download_deps.sh"], cwd=web)


def download_installer(web: Path, tag: str) -> Path:
    dest = web / "build" / "deps" / f"webkit-autoloader-installer_{tag}.elf"
    release = json.loads(fetch(f"https://api.github.com/repos/itsPLK/ps5-webkit-autoloader/releases/tags/{tag}"))
    asset = next((a for a in release.get("assets", []) if a.get("name") == dest.name), None)
    if asset is None:
        raise SystemExit(f"release {tag} has no {dest.name}")
    digest = asset.get("digest", "")
    digest = digest.split(":", 1)[-1] if ":" in digest else digest
    if dest.is_file() and digest:
        got = hashlib.sha256(dest.read_bytes()).hexdigest()
        if got == digest:
            print(f"{dest.name} already present and verified", flush=True)
            return dest
    print(f"Downloading {asset['browser_download_url']}", flush=True)
    dest.parent.mkdir(parents=True, exist_ok=True)
    data = fetch(asset["browser_download_url"])
    if digest and hashlib.sha256(data).hexdigest() != digest:
        raise SystemExit(f"sha256 mismatch for {dest.name}")
    dest.write_bytes(data)
    print(f"{dest.name} ready ({len(data)} bytes)", flush=True)
    return dest


def build_page(web: Path, installer: Path, version: str) -> Path:
    elfldr_tag = capture(
        ["git", "-C", str(web / "third_party" / "ps5-elfldr"), "describe", "--tags", "--always"],
        web,
    )
    out = web / "build" / "autoloader"
    if out.exists():
        shutil.rmtree(out)
    run([
        sys.executable, str(web / "tools" / "build_modular_page.py"),
        "--output-dir", str(out),
        "--loader-dir", str(web / "third_party" / "ps5-webkit-remote-loader"),
        "--version", version,
        "--elfldr-name", f"elfldr-ps5-{elfldr_tag}.elf",
        "--elfldr-bin", str(web / "build" / "deps" / "elfldr.elf"),
        "--payload-name", installer.name,
        "--payload-bin", str(installer),
    ], cwd=web)
    page = out / "index.html"
    if not page.is_file():
        raise SystemExit(f"missing {page}")
    if not (out / installer.name).is_file():
        raise SystemExit(f"installer ELF was not staged: {installer.name}")
    return out


def drop_unused_elfldr(version_dir: Path) -> None:
    import re
    html = (version_dir / "index.html").read_text(encoding="utf-8")
    match = re.search(r'ELFLDR_ELF:\s*"([^"]+)"', html)
    if not match:
        return
    keep = Path(match.group(1)).name
    shared = version_dir / "shared"
    if not shared.is_dir():
        return
    for elf in shared.glob("elfldr*.elf"):
        if elf.name != keep:
            print(f"dropping unused {elf.name}", flush=True)
            elf.unlink()


def write_manifest(out: Path, version: str, build_time: str) -> None:
    pointer = "/app/index.html"
    marker = None
    files = []
    for path in out.rglob("*"):
        if not path.is_file():
            continue
        rel = "/" + path.relative_to(out).as_posix()
        if rel in ("/cache.appcache", pointer) or rel.endswith("/__complete__"):
            if rel.endswith("/__complete__"):
                marker = rel
            continue
        files.append(rel)
    if marker is None:
        raise SystemExit("missing __complete__ marker")
    files.sort()
    cached = files + [pointer, marker]
    lines = [
        "CACHE MANIFEST",
        f"# WebKit Autoloader v{version} (built {build_time})",
        "",
        "CACHE:",
        *cached,
        "",
        "NETWORK:",
        "*",
        "",
        "FALLBACK:",
        "/ /index.html",
    ]
    for rel in sorted(cached):
        if rel != "/index.html" and rel.endswith("/index.html"):
            lines.append(f"{rel[:rel.rfind('/') + 1]} {rel}")
    lines.append("")
    (out / "cache.appcache").write_text("\n".join(lines), encoding="utf-8")


def stage(web: Path, built: Path, out: Path, version: str, build_time: str) -> None:
    if out.exists():
        shutil.rmtree(out)
    version_dir = out / "app" / version
    shutil.copytree(built, version_dir)
    drop_unused_elfldr(version_dir)
    (version_dir / "__complete__").write_text(version + "\n", encoding="utf-8")

    logo = web / "frontend" / "installer-page" / "logo.svg"
    if not logo.is_file():
        logo = web / "assets" / "icon.svg"
    if not logo.is_file():
        raise SystemExit(f"logo not found under {web}")
    shutil.copy2(logo, out / "logo.svg")

    for name in ("index.html", "cache.html"):
        text = (INSTALLER / name).read_text(encoding="utf-8")
        (out / name).write_text(fill(text, version, build_time), encoding="utf-8")

    pointer = (web / "frontend" / "pointer" / "index.html").read_text(encoding="utf-8")
    (out / "app" / "index.html").write_text(fill(pointer, version, build_time), encoding="utf-8")
    write_manifest(out, version, build_time)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--web", type=Path, default=DEFAULT_WEB)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--skip-build", action="store_true")
    args = parser.parse_args()
    web = args.web.resolve()
    out = args.out.resolve()
    if not (web / "Makefile").is_file():
        raise SystemExit(f"upstream tree not found: {web}")

    version, base = read_version(web)
    tag = os.environ.get("WKAL_REF", "").strip() or f"v{base}"
    if args.skip_build:
        built = web / "build" / "autoloader"
        if not (built / "index.html").is_file():
            raise SystemExit(f"missing {built / 'index.html'}")
    else:
        prepare_tree(web)
        installer = download_installer(web, tag)
        built = build_page(web, installer, version)

    built_time = build_time_of(web)
    stage(web, built, out, version, built_time)
    print(f"Packed {out} version={version} installer={tag}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_DATA = ROOT / "src" / "data"
DOCS_DATA = ROOT / "docs" / "data"
DOCS_DATA.mkdir(parents=True, exist_ok=True)

MAPPING = [
    ("eco_tasks.json", "eco_tasks.js", "PMP_ECO"),
    ("tools_outputs.json", "tools_outputs.js", "PMP_TOOLS"),
    ("mock_test.json", "mock_test.js", "PMP_QUIZ"),
]

for src_name, dst_name, var_name in MAPPING:
    src_path = SRC_DATA / src_name
    if not src_path.exists():
        print(f"[SKIP] {src_path} not found")
        continue
    data = json.loads(src_path.read_text(encoding="utf-8"))
    dst_path = DOCS_DATA / dst_name
    js_content = f"window.{var_name} = {json.dumps(data, ensure_ascii=False, indent=2)};\n"
    dst_path.write_text(js_content, encoding="utf-8")
    print(f"[OK] {src_name} ({len(data)} items) -> {dst_path}")


#!/usr/bin/env python3
"""Scrape Arabic Agpeya prayers from St-Takla.org.

Extracts PRAYER PROSE only (not psalms/gospels which are resolved at runtime
from the Bible data). Uses English agpeya.json as a structural template,
replacing only the Arabic prayer text fields.
"""

import json
import re
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "packages" / "data" / "src" / "ar" / "agpeya"
OUT_DIR.mkdir(parents=True, exist_ok=True)

EN_JSON = ROOT / "packages" / "data" / "src" / "en" / "agpeya" / "agpeya.json"
EN_COMMON = ROOT / "packages" / "data" / "src" / "en" / "agpeya" / "common.json"

# Hour pages on St-Takla
HOURS = {
    "prime": "https://st-takla.org/Agpeya/Agbeya_01_Prime_.html",
    "terce": "https://st-takla.org/Agpeya/Agbeya_03_Terce_.html",
    "sext": "https://st-takla.org/Agpeya/Agbeya_06_Sext_.html",
    "none": "https://st-takla.org/Agpeya/Agbeya_09_None_.html",
    "vespers": "https://st-takla.org/Agpeya/Agbeya_11_Vespers_.html",
    "compline": "https://st-takla.org/Agpeya/Agbeya_12_Compline_.html",
    "midnight": "https://st-takla.org/Agpeya/Agbeya_Midnight_.html",
}

# Arabic names for each hour
ARABIC_NAMES = {
    "prime": "باكر",
    "terce": "الساعة الثالثة",
    "sext": "الساعة السادسة",
    "none": "الساعة التاسعة",
    "vespers": "الغروب",
    "compline": "النوم",
    "midnight": "نصف الليل",
}

# Arabic titles for common prayers (from St-Takla anchor names)
SECTION_MAP = {
    "مقدمة_كل_ساعة": "مقدمة كل ساعة",
    "الصلاة_الربانية": "الصلاة الربانية",
    "صلاة_الشكر": "صلاة الشكر",
    "بدء_الصلاة": "بدء الصلاة",
    "هلم_نسجد": "هلم نسجد",
    "بدء_صلاة_باكر": "بدء صلاة باكر",
    "بدء_صلاة_الثالثة": "بدء صلاة الثالثة",
    "بدء_صلاة_السادسة": "بدء صلاة السادسة",
    "بدء_صلاة_التاسعة": "بدء صلاة التاسعة",
    "بدء_صلاة_الغروب": "بدء صلاة الغروب",
    "بدء_صلاة_النوم": "بدء صلاة النوم",
    "نصف_الليل": "نصف الليل",
    "القطع_": "القطع",
    "تسبحة_الملائكة_": "تسبحة الملائكة",
    "الثلاث_تقديسات_": "الثلاث تقديسات",
    "السلام_لك_": "السلام لك",
    "قانون_الإيمان_المقدس_الأرثوذكسي_": "قانون الإيمان المقدس الأرثوذكسي",
    "قدوس_قدوس_قدوس_": "قدوس قدوس قدوس",
    "التحليل_": "التحليل",
    "تحليل_آخر_": "تحليل آخر",
    "طلبة_تصلى_آخر_كل_ساعة_": "طلبة تصلى آخر كل ساعة",
    "المزمور_الخمسون": "المزمور الخمسون",
}


def fetch_page(url: str) -> str:
    """Fetch and decode a St-Takla page (Windows-1256)."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
    }
    resp = requests.get(url, timeout=30, headers=headers)
    resp.encoding = "windows-1256"
    resp.raise_for_status()
    return resp.text


def extract_sections(html: str) -> dict[str, list[str]]:
    """Split page into sections keyed by anchor name, extracting text paragraphs.

    Psalm sections (المزمور_*) are extracted alongside prayer prose so they can be
    embedded as Coptic liturgical Arabic psalms (different from Van Dyck Bible).
    """
    # Find all anchor-name markers and their positions
    anchor_pattern = re.compile(r'<a\s+name="([^"]+)"[^>]*>')
    anchors = [(m.group(1), m.start()) for m in anchor_pattern.finditer(html)]

    sections: dict[str, list[str]] = {}
    for i, (name, start) in enumerate(anchors):
        end = anchors[i + 1][1] if i + 1 < len(anchors) else len(html)
        block = html[start:end]

        # Normalize name: strip trailing underscores and parentheses
        normalized = name.rstrip("_").strip("()")

        # Skip gospel/pauline sections (Bible text resolved at runtime)
        if normalized.startswith("إنجيل_"):
            continue
        if normalized.startswith("البولس_"):
            continue

        # Extract text from <p>, <div>, <span> tags; skip empty headers
        paragraphs: list[str] = []
        # Find all content-bearing elements
        for tag in re.finditer(
            r"<(?:p|div|span|font|b|h\d)(?:\s[^>]*)?>(.*?)</(?:p|div|span|font|b|h\d)>",
            block,
            re.DOTALL,
        ):
            text = strip_html(tag.group(1))
            if not text:
                continue
            # Skip TOC/navigation text
            if _is_nav_text(text):
                continue
            # Skip "empty" spacer headings
            if re.match(r"^\s*$", text):
                continue
            paragraphs.append(text)

        if paragraphs:
            # Store under normalized name
            if normalized not in sections:
                sections[normalized] = []
            sections[normalized].extend(paragraphs)

    return sections


def strip_html(text: str) -> str:
    """Remove HTML tags, entities, and extra whitespace from a string."""
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("&nbsp;", " ")
    text = text.replace("&amp;", "&")
    text = text.replace("&lt;", "<")
    text = text.replace("&gt;", ">")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _parse_verses(text: str) -> list[dict]:
    """Split Coptic liturgical Arabic psalm text into individual verses.

    The text may contain verse numbers like '2' or '10' between verses.
    We split on obvious verse boundaries — but the Coptic liturgical translation
    doesn't always have explicit verse numbers, so fall back to sentence splitting.
    """
    # Try splitting on standalone numbers (verse markers)
    parts = re.split(r'\s+(?=\d{1,3}\s)', text)
    if len(parts) > 1:
        verses = []
        for p in parts:
            p = p.strip()
            if not p:
                continue
            # Extract leading number as verse number
            m = re.match(r'^(\d{1,3})\s+(.*)', p)
            if m:
                verses.append({"num": int(m.group(1)), "text": m.group(2).strip()})
            else:
                verses.append({"num": len(verses) + 1, "text": p})
        if verses:
            return verses

    # Fall back: split on sentence boundaries
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [{"num": i + 1, "text": s.strip()} for i, s in enumerate(sentences) if s.strip()]


def _is_nav_text(text: str) -> bool:
    """Check if text looks like navigation/table-of-contents content."""
    nav_indicators = [
        "فاصل",
        "موقع الكنيسة",
        "الأنبا تكلا",
        "St-Takla",
        "←",
        "→",
        "السابق",
        "التالي",
        "صفحة",
        "الرجوع",
        "للأعلى",
    ]
    for indicator in nav_indicators:
        if indicator in text:
            return True
    # Text that's just numbers or brackets
    if re.match(r"^[\d\(\)\[\]\.\,\s\-]+$", text):
        return True
    return False


def gather_prayer_prose(sections: dict[str, list[str]], section_ids: list[str]) -> list[str]:
    """Combine multiple section IDs into one flat content array."""
    content: list[str] = []
    for sid in section_ids:
        if sid in sections:
            content.extend(sections[sid])
    return content


def build_hour(english_hour: dict, sections: dict[str, list[str]], hour_id: str) -> dict:
    """Build an Arabic hour entry using English structure as template."""
    # Start with a copy of English (for psalmRefs, gospelRef, etc.)
    ar = dict(english_hour)

    # Replace name with Arabic
    ar["name"] = ARABIC_NAMES.get(hour_id, english_hour["name"])
    # Keep englishName in English

    # Map St-Takla sections to hour structure
    # Hour-specific anchor prefix (e.g., "بدء_صلاة_باكر" for prime)
    hour_start_map = {
        "prime": "بدء_صلاة_باكر",
        "terce": "بدء_صلاة_الثالثة",
        "sext": "بدء_صلاة_السادسة",
        "none": "بدء_صلاة_التاسعة",
        "vespers": "بدء_صلاة_الغروب",
        "compline": "بدء_صلاة_النوم",
        "midnight": "نصف_الليل",
    }

    # --- Opening ---
    # Try hour-specific opening first, fall back to generic بدء_الصلاة
    hour_start = hour_start_map.get(hour_id, "")
    opening_keys = [k for k in ["مقدمة_كل_ساعة", hour_start, "بدء_الصلاة", "هلم_نسجد"] if k]
    opening_content = gather_prayer_prose(sections, opening_keys)
    if opening_content:
        ar["opening"] = {
            "inline": True,
            "content": opening_content,
        }

    # --- Thanksgiving ---
    thanksgiving_content = gather_prayer_prose(sections, ["صلاة_الشكر"])
    if thanksgiving_content:
        ar["thanksgiving"] = {
            "title": "صلاة الشكر",
            "inline": False,
            "content": thanksgiving_content,
        }

    # --- Psalms intro ---
    # This is typically not a named section on St-Takla; copy from English
    # but check if there's an Arabic version
    if "psalmsIntro" in ar and ar["psalmsIntro"]:
        # Try to find Arabic version in the page
        for key in sections:
            if "مزامير" in SECTION_MAP.get(key, key) or "مزامير" in " ".join(sections.get(key, [])):
                ar["psalmsIntro"] = sections[key][0]
                break

    # --- Litanies ---
    litanies_content = gather_prayer_prose(sections, [
        "القطع",
        "تسبحة_الملائكة",
        "قدوس_قدوس_قدوس",
        "طلبة_تصلى_آخر_كل_ساعة",
    ])
    if litanies_content:
        ar["litanies"] = {
            "title": "الطلبات",
            "content": litanies_content,
        }

    # --- Coptic liturgical Arabic psalms (from St-Takla embedded text) ---
    # Extract psalm text from the page — these use the Coptic liturgical Arabic
    # translation, not the standard Van Dyck Bible.
    # Psalm sections appear on the page in the same order as psalmRefs, so we
    # iterate in page order (not alphabetical) to match correctly.
    psalm_keys = [k for k in sections if k.startswith("المزمور_") and k != "المزمور_الخمسون"]
    if psalm_keys:
        agpeya_psalms = []
        psalm_refs = ar.get("psalmRefs", [])
        for i, key in enumerate(psalm_keys):
            verses_text = sections[key]
            if verses_text:
                # Split the psalm text into individual verses
                verses = _parse_verses(" ".join(verses_text))
                ref = psalm_refs[i] if i < len(psalm_refs) else {"psalmNumber": 0, "title": key}
                agpeya_psalms.append({
                    "reference": f"Psalm {ref.get('psalmNumber', '?')}",
                    "title": ref.get("title", key.replace("المزمور_", "المزمور ")),
                    "rubric": ref.get("rubric"),
                    "verses": verses,
                })
        if agpeya_psalms:
            ar["psalms"] = agpeya_psalms

    # --- Closing ---
    closing_content = gather_prayer_prose(sections, [
        "التحليل",
        "تحليل_آخر",
    ])
    if closing_content:
        ar["closing"] = {
            "title": "الختام",
            "inline": False,
            "content": closing_content,
        }

    # --- Lord's Prayer (if present in English template) ---
    if "lordsPrayer" in ar:
        lp = gather_prayer_prose(sections, ["الصلاة_الربانية"])
        if lp:
            ar["lordsPrayer"] = {
                "title": "الصلاة الربانية",
                "inline": True,
                "content": lp,
            }

    # --- introduction ---
    intro_content = gather_prayer_prose(sections, ["من_إيمان_الكنيسة"])
    if intro_content:
        ar["introduction"] = " ".join(intro_content)

    # Ensure embedded gospel text from English template is removed
    # (psalms are populated from St-Takla's Coptic liturgical Arabic above)
    if "gospel" in ar:
        del ar["gospel"]

    return ar


def build_embedded_psalms(
    sections: dict[str, list[str]], psalm_keys: list[str], psalm_refs: list[dict]
) -> list[dict]:
    """Build resolved liturgical Psalms in the same order as the template references."""
    psalms: list[dict] = []
    for key, ref in zip(psalm_keys, psalm_refs):
        verses_text = sections.get(key, [])
        if not verses_text:
            continue
        psalms.append({
            "reference": f"Psalm {ref['psalmNumber']}",
            "title": ref.get("title", key.replace("المزمور_", "المزمور ")),
            "rubric": ref.get("rubric"),
            "verses": _parse_verses(" ".join(verses_text)),
        })
    return psalms


def build_midnight(english_midnight: dict, sections: dict[str, list[str]]) -> dict:
    """Build the Arabic Midnight hour and its three watches from St-Takla anchors."""
    midnight = dict(english_midnight)
    midnight.update({
        "name": ARABIC_NAMES["midnight"],
        "introduction": " ".join(sections.get("الخدمة_الأولى", [])),
    })

    opening = gather_prayer_prose(sections, ["مقدمة_كل_ساعة", "الصلاة_الربانية"])
    if opening:
        midnight["opening"] = {"inline": True, "content": opening}

    thanksgiving = gather_prayer_prose(sections, ["صلاة_الشكر"])
    if thanksgiving:
        midnight["thanksgiving"] = {
            "title": "صلاة الشكر",
            "inline": False,
            "content": thanksgiving,
        }

    watch_specs = [
        ("بدء_الصلاة_1", "القطع", "الخدمة الأولى", "السهر والاستعداد"),
        ("بدء_الصلاة_2", "القطع_2", "الخدمة الثانية", "التوبة والدموع"),
        ("بدء_الصلاة_3", "القطع_3", "الخدمة الثالثة", "الدينونة والرجاء"),
    ]
    section_keys = list(sections)
    watches: list[dict] = []
    for template, (start_key, litany_key, name, theme) in zip(
        english_midnight["watches"], watch_specs
    ):
        start = section_keys.index(start_key)
        end = section_keys.index(litany_key)
        psalm_keys = [key for key in section_keys[start + 1:end] if key.startswith("المزمور_")]
        watch = dict(template)
        watch.update({
            "name": name,
            "theme": theme,
            "psalmsIntro": sections[start_key][-1],
            "psalms": build_embedded_psalms(sections, psalm_keys, template["psalmRefs"]),
            "litanies": {"content": sections.get(litany_key, [])},
        })
        # Never retain prose copied from the English structural template.
        watch.pop("opening", None)
        watch.pop("closing", None)
        watches.append(watch)
    midnight["watches"] = watches

    closing = gather_prayer_prose(
        sections,
        ["التحليل", "طلبة_تصلى_آخر_كل_ساعة", "التحليل_الكبير_لنصف_الليل"],
    )
    midnight["closing"] = {"inline": False, "content": closing}
    return midnight


def build_common(sections: dict[str, list[str]]) -> dict:
    """Build common.json from St-Takla sections."""
    common: dict[str, dict] = {}

    # Opening Invocation (مقدمة كل ساعة)
    opening = gather_prayer_prose(sections, ["مقدمة_كل_ساعة"])
    if opening:
        common["openingInvocation"] = {
            "id": "opening-invocation",
            "title": "بدء الصلاة",
            "inline": True,
            "content": opening,
        }

    # Lord's Prayer
    lp = gather_prayer_prose(sections, ["الصلاة_الربانية"])
    if lp:
        common["lordsPrayer"] = {
            "id": "lords-prayer",
            "title": "الصلاة الربانية",
            "inline": True,
            "content": lp,
        }

    # Thanksgiving
    thanks = gather_prayer_prose(sections, ["صلاة_الشكر"])
    if thanks:
        common["thanksgivingPrayer"] = {
            "id": "thanksgiving-prayer",
            "title": "صلاة الشكر",
            "inline": False,
            "content": thanks,
        }

    # Trisagion (الثلاث تقديسات)
    trisagion = gather_prayer_prose(sections, ["الثلاث_تقديسات"])
    if trisagion:
        common["holyGod"] = {
            "id": "holy-god",
            "title": "الثلاث تقديسات",
            "inline": True,
            "content": trisagion,
        }

    # Absolution (التحليل)
    absolution = gather_prayer_prose(sections, ["التحليل", "تحليل_آخر"])
    if absolution:
        common["absolution"] = {
            "id": "absolution",
            "title": "التحليل",
            "inline": False,
            "content": absolution,
        }

    # Creed (قانون الإيمان)
    creed = gather_prayer_prose(sections, ["قانون_الإيمان_المقدس_الأرثوذكسي"])
    if creed:
        common["creed"] = {
            "id": "creed",
            "title": "قانون الإيمان",
            "inline": True,
            "content": creed,
        }

    return common


def main():
    # Load English template
    with open(EN_JSON, "r", encoding="utf-8") as f:
        en_data = json.load(f)

    # Scrape each hour
    ar_hours: dict[str, dict] = {}
    all_common: dict[str, dict] = {}
    sections_by_hour: dict[str, dict[str, list[str]]] = {}

    for hour_id, url in HOURS.items():
        print(f"Scraping {hour_id} ({ARABIC_NAMES[hour_id]})...")
        try:
            html = fetch_page(url)
        except Exception as e:
            print(f"  ERROR fetching: {e}")
            continue

        sections = extract_sections(html)
        sections_by_hour[hour_id] = sections
        print(f"  Found {len(sections)} sections: {list(sections.keys())}")

        # Build hour entry
        en_hour = en_data["hours"].get(hour_id)
        if en_hour:
            ar_hour = build_hour(en_hour, sections, hour_id)
            ar_hours[hour_id] = ar_hour

        # Collect common sections from the first hour (they're the same across hours)
        if hour_id == "prime":
            all_common = build_common(sections)

    # Build output
    output = {
        "common": en_data.get("common", {}),
        "hours": ar_hours,
    }

    # Midnight is one source page containing three ordered watches.
    if "midnight" in en_data:
        output["midnight"] = build_midnight(
            en_data["midnight"], sections_by_hour.get("midnight", {})
        )

    # Write agpeya.json
    out_path = OUT_DIR / "agpeya.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f"\nWrote {out_path} ({out_path.stat().st_size} bytes)")

    # Write common.json
    common_path = OUT_DIR / "common.json"
    with open(common_path, "w", encoding="utf-8") as f:
        json.dump(all_common, f, ensure_ascii=False, indent=2)
    print(f"Wrote {common_path} ({common_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()

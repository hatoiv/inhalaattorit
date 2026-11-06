-- Patient guides (printable PDF instructions).
-- Run on every startup, so everything here must be safe to run repeatedly
-- against an existing database (IF NOT EXISTS only, never drop or alter).

-- category: which group the guide is listed under on the inhaler usage page
-- (NULL = not listed there, only on product pages)
CREATE TABLE IF NOT EXISTS guide (
    id INTEGER PRIMARY KEY,
    category TEXT
);

-- name per language, and whether that language has a PDF.
-- the PDF itself is stored at data/guides/{guide_id}-{language}.pdf,
-- file_version changes on every upload so browsers don't show a cached old file
CREATE TABLE IF NOT EXISTS guide_translation (
    guide_id INTEGER NOT NULL,
    language TEXT NOT NULL,
    name TEXT NOT NULL,
    file_version INTEGER,
    PRIMARY KEY (guide_id, language),
    FOREIGN KEY (guide_id) REFERENCES guide(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medicine_guide (
    medicine_id INTEGER,
    guide_id INTEGER,
    PRIMARY KEY (medicine_id, guide_id),
    FOREIGN KEY (medicine_id) REFERENCES medicine(id) ON DELETE CASCADE,
    FOREIGN KEY (guide_id) REFERENCES guide(id) ON DELETE RESTRICT
);

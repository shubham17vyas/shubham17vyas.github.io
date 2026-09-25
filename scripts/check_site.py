"""Validate homepage assets, internal anchors, unique IDs, and structured data."""

from collections import Counter
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


class PageReferences(HTMLParser):
    """Collect homepage references for the static-site checker.

    Used by: check_site. Constructor parameters: none.
    Public methods: handle_starttag(tag, attrs), called by HTMLParser.feed.
    Example: parser = PageReferences(); parser.feed(markup).
    """

    def __init__(self):
        """Initialize collections used by the parser.

        Parameters: none. Returns: None. Exceptions: none.
        Side effects: initializes instance state. Time/space: O(1).
        """
        super().__init__()
        # Lists hold IDs and URL strings; errors stores human-readable image failures.
        self.ids = []
        self.references = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        """Collect references and check image accessibility metadata.

        Used by: HTMLParser.feed.
        Parameters: tag (str), element name; attrs (list), attribute/value pairs.
        Returns: None. Exceptions: none for valid parser input.
        Side effects: appends IDs, references, and errors.
        Time/space: O(a) for attributes and source-set entries.
        """
        attributes = dict(attrs)
        if 'id' in attributes:
            self.ids.append(attributes['id'])
        for name in ('href', 'src'):
            if attributes.get(name):
                self.references.append(attributes[name])
        for source in attributes.get('srcset', '').split(','):
            if source.strip():
                self.references.append(source.strip().split()[0])
        if tag == 'img' and any(name not in attributes for name in ('alt', 'width', 'height')):
            self.errors.append(f'Image needs alt and dimensions: {attributes.get("src")}')


def check_site():
    """Fail on broken local references and invalid homepage metadata.

    Used by: command-line validation before publishing.
    Parameters: none. Returns: None.
    Raises: ValueError for validation failures; OSError for unreadable files.
    Side effects: reads site files and prints a validation result.
    Time: O(n) for markup and references; space: O(n).
    """
    # Path anchors validation to the repository regardless of the caller's directory.
    root = Path(__file__).resolve().parents[1]
    markup = (root / 'index.html').read_text(encoding='utf-8')
    parser = PageReferences()
    parser.feed(markup)
    errors = parser.errors
    ids = set(parser.ids)
    errors.extend(f'Duplicate ID: {name}' for name, count in Counter(parser.ids).items() if count > 1)
    for reference in parser.references:
        url = urlsplit(reference)
        if url.scheme or url.netloc:
            continue
        if url.path and not (root / unquote(url.path).lstrip('/')).is_file():
            errors.append(f'Missing file: {url.path}')
        if not url.path and url.fragment and unquote(url.fragment) not in ids:
            errors.append(f'Missing anchor: {url.fragment}')
    for source in re.findall(r'<script type="application/ld\+json">(.*?)</script>', markup, re.S):
        json.loads(source)
    stylesheet = (root / 'css/main.css').read_text(encoding='utf-8')
    for reference in re.findall(r'url\(["\']?([^"\')]+)', stylesheet):
        if not (root / 'css' / reference).is_file():
            errors.append(f'Missing CSS asset: {reference}')
    if errors:
        raise ValueError('\n'.join(errors))
    print(f'Passed: {len(parser.references)} references, unique IDs, image metadata, CSS assets, JSON-LD.')


if __name__ == '__main__':
    check_site()

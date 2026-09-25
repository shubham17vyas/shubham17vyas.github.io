"""Build responsive WebP derivatives while preserving the original photographs."""

from pathlib import Path
import re

from PIL import Image, ImageOps

# Paths locate the repository and generated assets independently of the working directory.
ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'images' / 'optimized'
# Pixel widths cover small screens and high-density displays without upscaling originals.
WIDTHS = (480, 960)


def optimize_images():
    """Create derivatives and update original image references in the homepage.

    Used by: the command-line asset maintenance task.
    Parameters: none. Returns: None.
    Raises: OSError for unreadable inputs or unwritable outputs.
    Side effects: writes WebP files and updates index.html.
    Time: O(p) for total processed pixels; space: O(m) for the largest image.
    """
    OUTPUT.mkdir(parents=True, exist_ok=True)
    # Dictionary maps original relative paths to available width/path pairs.
    variants = {}
    for source in sorted((ROOT / 'images' / 'life').glob('*.jpg')):
        with Image.open(source) as original:
            photo = ImageOps.exif_transpose(original).convert('RGB')
            variants[source.relative_to(ROOT).as_posix()] = []
            for width in sorted({min(size, photo.width) for size in WIDTHS}):
                height = round(photo.height * width / photo.width)
                destination = OUTPUT / f'{source.stem}-{width}.webp'
                photo.resize((width, height), Image.Resampling.LANCZOS).save(
                    destination, 'WEBP', quality=78, method=6
                )
                variants[source.relative_to(ROOT).as_posix()].append(
                    (width, destination.relative_to(ROOT).as_posix())
                )
    homepage = ROOT / 'index.html'
    markup = homepage.read_text(encoding='utf-8')
    for source, sizes in variants.items():
        # Pattern targets original tags only; reruns do not duplicate attributes.
        pattern = r'<img\b[^>]*\bsrc="' + re.escape(source) + r'"[^>]*>'
        for match in re.finditer(pattern, markup):
            tag = match.group()
            width = int(re.search(r'\bwidth="(\d+)"', tag).group(1))
            height = int(re.search(r'\bheight="(\d+)"', tag).group(1))
            ratio = width / height
            if 'decoding="async"' in tag:
                slot = f'(max-width: 600px) {round(220 * ratio)}px, (max-width: 900px) {round(240 * ratio)}px, {round(275 * ratio)}px'
            else:
                slot = '(max-width: 600px) 285px, 420px'
            sources = ', '.join(f'{path} {size}w' for size, path in sizes)
            replacement = tag.replace(
                f'src="{source}"',
                f'src="{sizes[-1][1]}" srcset="{sources}" sizes="{slot}"'
            )
            markup = markup.replace(tag, replacement)
    homepage.write_text(markup, encoding='utf-8')
    # Byte totals compare one largest derivative per original, not both responsive variants.
    original_bytes = sum((ROOT / path).stat().st_size for path in variants)
    served_bytes = sum((ROOT / sizes[-1][1]).stat().st_size for sizes in variants.values())
    print(f'Original photos: {original_bytes:,} bytes; largest WebP set: {served_bytes:,} bytes')


if __name__ == '__main__':
    optimize_images()

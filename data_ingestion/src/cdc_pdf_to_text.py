import fitz  # PyMuPDF
import re

def extract_pdf_text(pdf_path):
    doc = fitz.open(pdf_path)
    return "\n".join([page.get_text() for page in doc])

def parse_chapters_and_articles(text):
    
    text = re.sub(r'\n+', '\n', text).replace('\xa0', ' ')

    chapter_matches = list(re.finditer(r'(CAP[IÍ]TULO\s+([IVXLCDM]+))', text))
    chapter_boundaries = [m.start() for m in chapter_matches] + [len(text)]
    chapters = []

    for i in range(len(chapter_matches)):
        chapter_number = chapter_matches[i].group(2).strip()
        start = chapter_matches[i].start()
        end = chapter_boundaries[i + 1]
        chapter_text = text[start:end]

        # Find articles inside the chapter
        article_matches = list(re.finditer(r'(Art\.?\s*\d+[^\n]*)(.*?)(?=Art\.?\s*\d+|$)', chapter_text, re.DOTALL))
        for article_match in article_matches:
            art_heading = article_match.group(1).strip()
            art_number = re.findall(r'\d+', art_heading)[0]
            art_content = (art_heading + " " + article_match.group(2)).strip()
            for paragraph in art_content.split('\n\n'):
                if len(paragraph) > 0:
                    chapters.append((chapter_number, paragraph.strip().replace('\n', ' ')))

    return chapters

def write_structured_output(chapters, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        for chapter, content in chapters:
            f.write(f"CAPITULO {chapter} - {content}\n")

if __name__ == "__main__":
    pdf_path = "CDC.pdf"
    output_path = "CDC.txt"
    full_text = extract_pdf_text(pdf_path)
    parsed = parse_chapters_and_articles(full_text)
    write_structured_output(parsed, output_path)
    print(f"Structured output written to {output_path}")
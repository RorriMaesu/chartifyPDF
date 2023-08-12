from flask import Flask, render_template, request, jsonify, send_from_directory
import fitz  # PyMuPDF
import csv
import os
import logging

app = Flask(__name__, template_folder='.')
logging.basicConfig(level=logging.DEBUG)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def analyze_pdf():
    file = request.files['file']
    
    # Extract text from PDF using PyMuPDF
    pdf_text, pages_text_length = extract_text_from_pdf(file)
    
    # Simple analysis - for demo purposes, score is the total characters
    score = len(pdf_text)
    
    return jsonify(score=score, total_text=pdf_text[:1000], pages_text_length=pages_text_length)  # send the first 1000 characters for the demo

@app.route('/export', methods=['POST'])
def export_data():
    data = request.json
    filename = "analysis.csv"
    try:
        with open(filename, "w", newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(["Score", "Total Text"])
            writer.writerow([data['score'], data['total_text']])
        logging.debug(f"File {filename} written successfully.")
        
        if os.path.exists(filename):
            logging.debug(f"Sending file {filename} to client.")
            return send_from_directory('.', filename, as_attachment=True)
        else:
            logging.error(f"File {filename} not found.")
            return "Error: File not found", 500
            
    except Exception as e:
        logging.error(f"Exception encountered: {e}")
        return str(e), 500

def extract_text_from_pdf(file):
    pdf_document = fitz.open(stream=file.read(), filetype="pdf")
    text = ""
    pages_text_length = []
    for page_num in range(pdf_document.page_count):
        page = pdf_document[page_num]
        page_text = page.get_text()
        text += page_text
        pages_text_length.append(len(page_text))
    pdf_document.close()
    return text, pages_text_length

if __name__ == '__main__':
    app.run(debug=True)

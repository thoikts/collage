import os
from flask import Flask, render_template

app = Flask(__name__, static_url_path='')

@app.route('/', defaults={'id': None})
@app.route('/c/<id>')
def collage(id):
	return render_template('index.html')

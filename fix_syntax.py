with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('</div></div>\n          </div>\n        </div>\n\n        {/* RIGHT PANEL', '</div>\n          </div>\n        </div>\n\n        {/* RIGHT PANEL')

with open('src/App.tsx', 'w') as f:
    f.write(content)

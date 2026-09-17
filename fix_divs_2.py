import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Replace 4 divs with 3
content = content.replace("              </div>\n            </div>\n          </div>\n          </div>\n          <p", "              </div>\n            </div>\n          </div>\n          <p")

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

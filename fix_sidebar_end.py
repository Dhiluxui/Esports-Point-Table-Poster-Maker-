import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

old_end = """              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: POSTER PREVIEW */}"""

new_end = """              </div>
            </div>
          </div>
        </div>
        )}

        {/* RIGHT PANEL: POSTER PREVIEW */}"""

content = content.replace(old_end, new_end)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

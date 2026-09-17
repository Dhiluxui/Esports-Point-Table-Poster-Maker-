import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# I want to grab from `{/* Background Overlay (if no user BG) */}` all the way down to the closing tag of the internal poster structure.
# Let's be precise.
start_str = "              {/* Background Overlay (if no user BG) */}"
end_str = "              </div>\n            </div>\n          </div>"
idx1 = content.find(start_str)
idx2 = content.find(end_str, idx1)

if idx1 != -1 and idx2 != -1:
    poster_content = content[idx1:idx2]
    # We will save this snippet.
    with open('classic_snippet.txt', 'w') as f:
        f.write(poster_content)
    print("Extracted successfully.")
else:
    print("Could not extract.")


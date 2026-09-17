import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

import_statement = """import { TemplateClassic } from './components/templates/TemplateClassic';
import { TemplateRedGold } from './components/templates/TemplateRedGold';
import { TemplateBlueHighlight } from './components/templates/TemplateBlueHighlight';
"""

content = content.replace("import { db, auth } from './lib/firebase';", "import { db, auth } from './lib/firebase';\n" + import_statement)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Replace Imports
content = content.replace("import { TemplateRedGold } from './components/templates/TemplateRedGold';", "import { TemplateCleanMinimal } from './components/templates/TemplateCleanMinimal';")
content = content.replace("import { TemplateBlueHighlight } from './components/templates/TemplateBlueHighlight';", "import { TemplateModernGlass } from './components/templates/TemplateModernGlass';")

# Replace Select options
old_options = """                        <option value="classic">Classic Pro</option>
                        <option value="red_gold">Royal Red & Gold</option>
                        <option value="blue_highlight">Neon Blue Highlights</option>"""
new_options = """                        <option value="classic">Classic Pro</option>
                        <option value="clean_minimal">Clean Minimal</option>
                        <option value="modern_glass">Modern Glass</option>"""
content = content.replace(old_options, new_options)

# Replace Render Block
old_render = """              {branding.templateStyle === 'red_gold' ? (
                <TemplateRedGold branding={branding} teams={teams} />
              ) : branding.templateStyle === 'blue_highlight' ? (
                <TemplateBlueHighlight branding={branding} teams={teams} />
              ) : ("""
new_render = """              {branding.templateStyle === 'clean_minimal' ? (
                <TemplateCleanMinimal branding={branding} teams={teams} />
              ) : branding.templateStyle === 'modern_glass' ? (
                <TemplateModernGlass branding={branding} teams={teams} />
              ) : ("""
content = content.replace(old_render, new_render)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)

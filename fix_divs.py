with open('src/components/templates/TemplateClassic.tsx', 'r') as f:
    content = f.read()
content = content.replace("    </>\n  );\n}", "</div></div>\n    </>\n  );\n}")
with open('src/components/templates/TemplateClassic.tsx', 'w') as f:
    f.write(content)

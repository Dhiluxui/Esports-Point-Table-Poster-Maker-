with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace("theme?: {", "templateStyle?: string;\n  theme?: {")

with open('src/types.ts', 'w') as f:
    f.write(content)

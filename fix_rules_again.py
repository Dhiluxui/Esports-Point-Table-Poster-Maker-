import re

with open('firestore.rules', 'r') as f:
    content = f.read()

content = content.replace("function isSignedIn() { return true; }", "function isSignedIn() { return request.auth != null; }")
content = content.replace("data.ownerId == 'anonymous'", "data.ownerId == request.auth.uid")
content = content.replace("existing().ownerId == 'anonymous'", "existing().ownerId == request.auth.uid")
content = content.replace("get(/databases/$(database)/documents/tournaments/$(tournamentId)).data.ownerId == 'anonymous'", "get(/databases/$(database)/documents/tournaments/$(tournamentId)).data.ownerId == request.auth.uid")

with open('firestore.rules', 'w') as f:
    f.write(content)

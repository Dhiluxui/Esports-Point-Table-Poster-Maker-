import re

with open('firestore.rules', 'r') as f:
    content = f.read()

content = content.replace("allow read: if isSignedIn();", "allow read: if isSignedIn() && existing().ownerId == request.auth.uid;")

with open('firestore.rules', 'w') as f:
    f.write(content)

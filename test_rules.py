import re

with open('firestore.rules', 'r') as f:
    content = f.read()

content = content.replace("allow read: if isSignedIn() && existing().ownerId == request.auth.uid;", "allow read: if isSignedIn();")
content = content.replace("allow read: if isSignedIn() && get(/databases/$(database)/documents/tournaments/$(tournamentId)).data.ownerId == request.auth.uid;", "allow read: if isSignedIn();")

with open('firestore.rules', 'w') as f:
    f.write(content)

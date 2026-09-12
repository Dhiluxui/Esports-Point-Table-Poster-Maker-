import re

with open('firestore.rules', 'r') as f:
    content = f.read()

# Make tournaments publicly readable
content = content.replace(
    "allow read: if isSignedIn() && existing().ownerId == request.auth.uid;",
    "allow read: if true;"
)
content = content.replace(
    "allow read: if isSignedIn() && get(/databases/$(database)/documents/tournaments/$(tournamentId)).data.ownerId == request.auth.uid;",
    "allow read: if true;"
)

# Update isValidTournament to allow teams and branding
old_valid = """    function isValidTournament(data) {
      return data.keys().hasAll(['ownerId', 'name', 'slots', 'createdAt', 'updatedAt'])
        && data.ownerId == request.auth.uid
        && data.name is string && data.name.size() <= 100
        && data.slots is number
        && data.createdAt is timestamp
        && data.updatedAt is timestamp;
    }"""

new_valid = """    function isValidTournament(data) {
      return data.keys().hasAll(['ownerId', 'name', 'slots', 'createdAt', 'updatedAt'])
        && data.ownerId == request.auth.uid
        && data.name is string && data.name.size() <= 100
        && data.slots is number
        && data.createdAt is timestamp
        && data.updatedAt is timestamp
        && (!data.keys().hasAny(['teams']) || data.teams is list)
        && (!data.keys().hasAny(['branding']) || data.branding is map);
    }"""
content = content.replace(old_valid, new_valid)

# Update the affectedKeys validation for tournament update
content = re.sub(
    r"hasOnly\(\['name', 'slots', 'updatedAt'\]\);",
    "hasOnly(['name', 'slots', 'teams', 'branding', 'updatedAt']);",
    content
)

with open('firestore.rules', 'w') as f:
    f.write(content)

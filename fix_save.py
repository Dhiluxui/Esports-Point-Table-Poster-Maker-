import re

with open('src/PointsTableEditor.tsx', 'r') as f:
    content = f.read()

# Add serverTimestamp to imports
content = content.replace(
    "import { collection, query, getDocs, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';",
    "import { collection, query, getDocs, orderBy, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';"
)

# Update saveToCloud
old_save = """  const saveToCloud = async () => {
    if (!id || !isOwner) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'tournaments', id), {
        teams,
        branding,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error saving to cloud:", error);
    }
    setIsSaving(false);
  };"""

new_save = """  const saveToCloud = async () => {
    if (!id || !isOwner) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'tournaments', id), {
        teams,
        branding,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving to cloud:", error);
      alert("Failed to save. Please make sure you are logged in and own this tournament.");
    }
    setIsSaving(false);
  };"""

content = content.replace(old_save, new_save)

with open('src/PointsTableEditor.tsx', 'w') as f:
    f.write(content)


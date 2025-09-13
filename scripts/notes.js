const noteList = document.getElementById("noteList");
const noteModal = document.getElementById("noteModal");
const modalNoteTitle = document.getElementById("modalNoteTitle");
const modalNoteBody = document.getElementById("modalNoteBody");

const addModal = document.getElementById("addModal");
const editModal = document.getElementById("editModal");

let editNoteId = null;

// Menü aç/kapat
function toggleNotesMenu() {
  document.getElementById("noteMenu").classList.toggle("open");
}

// Modal göster/gizle
function showAddModal() {
  addModal.classList.add("show");
}
function closeModal(modal) {
  modal.classList.remove("show");
}

// Butonlar
document.getElementById("openAddModal").onclick = showAddModal;
document.getElementById("cancelAddBtn").onclick = () => closeModal(addModal);
document.getElementById("cancelEditBtn").onclick = () => closeModal(editModal);
document.getElementById("closeNoteModal").onclick = () => closeModal(noteModal);

// Firestore referansı
const notesRef = db.collection("notes");

// Not ekle
document.getElementById("saveNoteBtn").onclick = async () => {
  const title = document.getElementById("newNoteTitle").value.trim();
  const body = document.getElementById("newNoteBody").value.trim();
  const user = firebase.auth().currentUser;

  if (title && body && user) {
    await notesRef.add({
      title,
      body,
      created: Date.now(),
      uid: user.uid
    });

    document.getElementById("newNoteTitle").value = "";
    document.getElementById("newNoteBody").value = "";
    closeModal(addModal);
  }
};

// Not düzenle
document.getElementById("updateNoteBtn").onclick = async () => {
  const title = document.getElementById("editNoteTitle").value.trim();
  const body = document.getElementById("editNoteBody").value.trim();

  if (editNoteId) {
    await notesRef.doc(editNoteId).update({ title, body });
    closeModal(editModal);
  }
};

// Not kartı oluştur
function createNoteItem(id, title, body) {
  const noteItem = document.createElement("div");
  noteItem.className = "note-item";
  noteItem.textContent = title;

  // Açma
  noteItem.onclick = () => {
    modalNoteTitle.textContent = title;
    modalNoteBody.textContent = body;
    noteModal.classList.add("show");
  };

  // Eylemler
  const actions = document.createElement("div");
  actions.className = "note-actions";

  const editBtn = document.createElement("button");
  editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M1.172,19.119A4,4,0,0,0,0,21.947V24H2.053a4,4,0,0,0,2.828-1.172L18.224,9.485,14.515,5.776Z"/><path d="M23.145.855a2.622,2.622,0,0,0-3.71,0L15.929,4.362l3.709,3.709,3.507-3.506A2.622,2.622,0,0,0,23.145.855Z"/></svg>';
  editBtn.onclick = (e) => {
    e.stopPropagation();
    editNoteId = id;
    document.getElementById("editNoteTitle").value = title;
    document.getElementById("editNoteBody").value = body;
    editModal.classList.add("show");
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="20" height="20" fill="red"><path d="M21,4H17.9A5.009,5.009,0,0,0,13,0H11A5.009,5.009,0,0,0,6.1,4H3A1,1,0,0,0,3,6H4V19a5.006,5.006,0,0,0,5,5h6a5.006,5.006,0,0,0,5-5V6h1a1,1,0,0,0,0-2ZM11,2h2a3.006,3.006,0,0,1,2.829,2H8.171A3.006,3.006,0,0,1,11,2Zm7,17a3,3,0,0,1-3,3H9a3,3,0,0,1-3-3V6H18Z"/><path d="M10,18a1,1,0,0,0,1-1V11a1,1,0,0,0-2,0v6A1,1,0,0,0,10,18Z"/><path d="M14,18a1,1,0,0,0,1-1V11a1,1,0,0,0-2,0v6A1,1,0,0,0,14,18Z"/></svg>';
  deleteBtn.onclick = async (e) => {
    e.stopPropagation();
    if (confirm("Delete the note?")) {
      await notesRef.doc(id).delete();
    }
  };

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  noteItem.appendChild(actions);

  noteList.appendChild(noteItem);
}

// Notları yükle
function loadNotes(user) {
  notesRef
    .where("uid", "==", user.uid)
    .orderBy("created", "desc")
    .onSnapshot(snapshot => {
      noteList.innerHTML = "";
      snapshot.forEach(doc => {
        const note = doc.data();
        createNoteItem(doc.id, note.title, note.body);
      });
    });
}

// Firebase auth dinleme
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    loadNotes(user);
  } else {
    console.log("Kullanıcı giriş yapmamış.");
  }
});
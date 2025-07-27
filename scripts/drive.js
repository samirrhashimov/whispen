const CLIENT_ID = '326327822458-9blrp41tjmgbh0kvtqu5n00602mbcjve.apps.googleusercontent.com';
const API_KEY = 'AIzaSyC-K_Bywpf1oMVb1Wj2_pU-zh0bsEfOSiM';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

window.handleClientLoad = function() {
  gapi.load('client:auth2', initClient);
}

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    scope: SCOPES,
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
  }).then(() => {
    document.getElementById('signin-button').onclick = handleAuthClick;
  });
}

function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn().then(() => {
    listPDFFiles();
  });
}

function listPDFFiles() {
  gapi.client.drive.files.list({
    q: "mimeType='application/pdf'",
    fields: "files(id, name, webViewLink, webContentLink)"
  }).then(response => {
    const files = response.result.files;
    const listEl = document.getElementById('drive-file-list');
    listEl.innerHTML = '';
    files.forEach(file => {
      const li = document.createElement('li');
      li.textContent = file.name;
      li.style.cursor = 'pointer';
      li.onclick = () => {
        window.open(file.webContentLink, '_blank');
      };
      listEl.appendChild(li);
    });
  });
}
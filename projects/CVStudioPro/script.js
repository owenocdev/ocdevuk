let cvData = { 
    work: [], 
    edu: [], 
    skills: [], 
    achieve: [],
    customSections: {} 
};

let currentOrder = ['work', 'edu', 'skills', 'achieve', 'extra'];

Sortable.create(document.getElementById('drag-list'), {
    animation: 150,
    onEnd: function(evt) {
        currentOrder = Array.from(evt.from.children).map(item => item.getAttribute('data-id'));
        update();
    }
});

function changeLayout() {
    const mode = document.getElementById('layoutSelect').value;
    document.getElementById('cv-canvas').className = 'layout-' + mode;
    update(); // Re-render to ensure structural changes apply properly
}

function loadPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('outPhoto');
            img.src = e.target.result;
            img.style.display = 'block';
            document.getElementById('photoUploadText').textContent = file.name.length > 18 ? file.name.substring(0,16)+'…' : file.name;
            document.getElementById('photoRemoveBtn').style.display = 'inline-flex';
        }
        reader.readAsDataURL(file);
    }
}

function removePhoto() {
    const img = document.getElementById('outPhoto');
    img.src = '';
    img.style.display = 'none';
    document.getElementById('inPhoto').value = '';
    document.getElementById('photoUploadText').textContent = 'Choose Photo';
    document.getElementById('photoRemoveBtn').style.display = 'none';
}

// --- Custom Modal Logic ---
function openModal() {
    document.getElementById('customCatModal').classList.add('active');
    document.getElementById('modalCatInput').focus();
}

function closeModal() {
    document.getElementById('customCatModal').classList.remove('active');
    document.getElementById('modalCatInput').value = '';
}

function submitCustomCategory() {
    const rawName = document.getElementById('modalCatInput').value;
    if (!rawName || rawName.trim() === "") {
        closeModal();
        return;
    }
    
    const secId = 'custom_' + Date.now();
    const cleanLabel = rawName.trim();
    
    cvData.customSections[secId] = {
        label: cleanLabel,
        items: []
    };
    
    const dragList = document.getElementById('drag-list');
    const dragItemHtml = `<div class="drag-item" data-id="${secId}"><i data-lucide="grip-vertical"></i> ${cleanLabel}</div>`;
    dragList.insertAdjacentHTML('beforeend', dragItemHtml);
    
    const entryContainer = document.getElementById('dynamic-input-groups');
    const inputGroupHtml = `
        <div class="input-group" id="group-${secId}">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <label>${cleanLabel}</label>
                <button class="remove-btn" style="position:static;" onclick="removeCustomSection('${secId}')">✕</button>
            </div>
            <div id="${secId}-inputs"></div>
            <button class="add-btn" onclick="addItem('${secId}')">+ Add Entry to ${cleanLabel}</button>
        </div>`;
    entryContainer.insertAdjacentHTML('beforeend', inputGroupHtml);
    
    currentOrder.push(secId);
    lucide.createIcons();
    update();
    closeModal();
}

function removeCustomSection(secId) {
    delete cvData.customSections[secId];
    currentOrder = currentOrder.filter(id => id !== secId);
    const dragItem = document.querySelector(`.drag-item[data-id="${secId}"]`);
    if(dragItem) dragItem.remove();
    const groupItem = document.getElementById(`group-${secId}`);
    if(groupItem) groupItem.remove();
    update();
}

// --- Dynamic Inputs ---
function addItem(type) {
    const id = Date.now();
    let targetContainer = "";
    let html = `<div class="repeater-item" id="item-${id}"><button class="remove-btn" onclick="removeItem('${type}', ${id})">✕</button>`;
    
    if (type === 'edu') {
        html += `<input type="text" placeholder="Education Centre" oninput="updateItem('edu',${id},'name',this.value)">
                 <div class="date-grid">
                    <input type="text" placeholder="Start Year" oninput="updateItem('edu',${id},'start',this.value)">
                    <input type="text" placeholder="End Year/Present" oninput="updateItem('edu',${id},'end',this.value)">
                 </div>
                 <div id="qual-list-${id}" class="nested-repeater"></div>
                 <button class="add-btn" onclick="addQual(${id})">+ Qual & Grade</button>`;
        cvData.edu.push({ id, name: '', start: '', end: '', quals: [] });
        targetContainer = 'edu-inputs';
    } else if (type === 'work') {
        html += `<input type="text" placeholder="Company" oninput="updateItem('work',${id},'title',this.value)">
                 <input type="text" placeholder="Date" oninput="updateItem('work',${id},'start',this.value)">
                 <textarea placeholder="Description..." oninput="updateItem('work',${id},'desc',this.value)"></textarea>`;
        cvData.work.push({ id, title: '', start: '', desc: '' });
        targetContainer = 'work-inputs';
    } else if (type.startsWith('custom_')) {
        html += `<input type="text" placeholder="Entry Title" oninput="updateCustomItem('${type}',${id},'title',this.value)">
                 <textarea placeholder="Details..." oninput="updateCustomItem('${type}',${id},'desc',this.value)"></textarea>`;
        cvData.customSections[type].items.push({ id, title: '', desc: '' });
        targetContainer = `${type}-inputs`;
    } else {
        html += `<input type="text" placeholder="Title" oninput="updateItem('${type}',${id},'title',this.value)">
                 <textarea placeholder="Details..." oninput="updateItem('${type}',${id},'desc',this.value)"></textarea>`;
        cvData[type].push({ id, title: '', desc: '' });
        targetContainer = `${type}-inputs`;
    }
    
    document.getElementById(targetContainer).insertAdjacentHTML('beforeend', html + `</div>`);
}

function addQual(eduId) {
    const qId = Date.now();
    cvData.edu.find(i => i.id === eduId).quals.push({ id: qId, title: '', grade: '' });
    const html = `
        <div class="nested-item" id="qual-${qId}">
            <input type="text" placeholder="Qual" style="flex:2" oninput="updateQual(${eduId}, ${qId}, 'title', this.value)">
            <input type="text" placeholder="Grade" style="flex:1" oninput="updateQual(${eduId}, ${qId}, 'grade', this.value)">
            <button onclick="removeQual(${eduId}, ${qId})" style="border:none; background:none; color:red; cursor:pointer">✕</button>
        </div>`;
    document.getElementById(`qual-list-${eduId}`).insertAdjacentHTML('beforeend', html);
}

function updateQual(eId, qId, f, v) { cvData.edu.find(i => i.id === eId).quals.find(q => q.id === qId)[f] = v; update(); }
function removeQual(eId, qId) { 
    const edu = cvData.edu.find(i => i.id === eId);
    edu.quals = edu.quals.filter(q => q.id !== qId);
    document.getElementById(`qual-${qId}`).remove();
    update(); 
}
function updateItem(t, id, f, v) { cvData[t].find(i => i.id === id)[f] = v; update(); }
function updateCustomItem(t, id, f, v) { cvData.customSections[t].items.find(i => i.id === id)[f] = v; update(); }

function removeItem(t, id) { 
    if (t.startsWith('custom_')) {
        cvData.customSections[t].items = cvData.customSections[t].items.filter(i => i.id !== id);
    } else {
        cvData[t] = cvData[t].filter(i => i.id !== id); 
    }
    document.getElementById(`item-${id}`).remove(); 
    update(); 
}

function update() {
    ['Name', 'Role', 'Email', 'Phone', 'Loc', 'Summary'].forEach(f => {
        const el = document.getElementById('out' + f);
        if(el) el.innerText = document.getElementById('in' + f).value || "";
    });

    const container = document.getElementById('section-container');
    container.innerHTML = '';
    
    currentOrder.forEach(secId => {
        if (secId === 'extra') {
            const val = document.getElementById('inExtra').value.trim();
            if (val !== "") container.innerHTML += `<div class="cv-section"><h3>Additional Info</h3><div class="desc-text">${val}</div></div>`;
            return;
        }

        let label = "";
        let hasContent = false;
        let html = "";

        if (secId.startsWith('custom_')) {
            const customSec = cvData.customSections[secId];
            if (customSec && customSec.items.length > 0) {
                label = customSec.label;
                hasContent = true;
                html += customSec.items.map(i => `<div class="cv-entry"><strong>${i.title}</strong><div class="desc-text">${i.desc}</div></div>`).join('');
            }
        } else {
            const dragItem = document.querySelector(`.drag-item[data-id="${secId}"]`);
            label = dragItem ? dragItem.innerText.trim() : secId;
            
            if (secId === 'work' && cvData.work.length > 0) {
                hasContent = true;
                html += cvData.work.map(i => `<div class="cv-entry"><div class="entry-header"><span>${i.title}</span><span class="date-text">${i.start}</span></div><div class="desc-text">${i.desc}</div></div>`).join('');
            } else if (secId === 'edu' && cvData.edu.length > 0) {
                hasContent = true;
                html += cvData.edu.map(i => `<div class="cv-entry"><div class="entry-header"><span>${i.name}</span><span class="date-text">${i.start} ${i.end ? '— '+i.end : ''}</span></div>${i.quals.map(q => `<div class="qual-row"><span>${q.title}</span><strong>${q.grade}</strong></div>`).join('')}</div>`).join('');
            } else if (cvData[secId] && cvData[secId].length > 0) {
                hasContent = true;
                html += cvData[secId].map(i => `<div class="cv-entry"><strong>${i.title}</strong><div class="desc-text">${i.desc}</div></div>`).join('');
            }
        }

        if (hasContent) container.innerHTML += `<div class="cv-section"><h3>${label}</h3>${html}</div>`;
    });
    lucide.createIcons();
}

function clearData() {
    document.getElementById('inName').value = '';
    document.getElementById('inRole').value = '';
    document.getElementById('inEmail').value = '';
    document.getElementById('inPhone').value = '';
    document.getElementById('inLoc').value = '';
    document.getElementById('inSummary').value = '';
    document.getElementById('inExtra').value = '';
    document.getElementById('inPhoto').value = '';
    document.getElementById('outPhoto').src = '';
    document.getElementById('outPhoto').style.display = 'none';
    document.getElementById('photoUploadText').textContent = 'Choose Photo';
    document.getElementById('photoRemoveBtn').style.display = 'none';
    
    cvData = { work: [], edu: [], skills: [], achieve: [], customSections: {} };
    
    document.getElementById('work-inputs').innerHTML = '';
    document.getElementById('edu-inputs').innerHTML = '';
    document.getElementById('skills-inputs').innerHTML = '';
    document.getElementById('achieve-inputs').innerHTML = '';
    document.getElementById('dynamic-input-groups').innerHTML = '';
    
    update();
}

function downloadPDF() {
    const canvas = document.getElementById('cv-canvas');
    const indicators = document.querySelectorAll('.no-pdf');
    indicators.forEach(el => el.style.display = 'none');

    html2pdf().from(canvas).set({ 
        margin: 0, 
        filename: 'Your_CV_Studio_Export.pdf', 
        html2canvas: { scale: 3 }, 
        jsPDF: { unit: 'px', format: [794, canvas.offsetHeight], hotfixes: ['px_scaling'] } 
    }).save().then(() => {
        indicators.forEach(el => el.style.display = 'block');
    });
}

const themes = {
    classic:  { accent: '#004085', sideBg: '#e9ecef' },
    forest:   { accent: '#2d6a4f', sideBg: '#d8f3dc' },
    crimson:  { accent: '#9a031e', sideBg: '#ffecd1' },
    slate:    { accent: '#343a40', sideBg: '#e2e8f0' },
    nordic:   { accent: '#2e6b8a', sideBg: '#dff0f7' },
    gold:     { accent: '#9a7c2a', sideBg: '#fdf5dc' },
    midnight: { accent: '#1a2a6c', sideBg: '#e8eaf6' },
    terra:    { accent: '#7a3b1e', sideBg: '#f5e6dc' }
};

function changeTheme() {
    const themeKey = document.getElementById('themeSelect').value;
    const selectedTheme = themes[themeKey];
    // Map variables perfectly so all layouts update instantly
    document.documentElement.style.setProperty('--accent', selectedTheme.accent);
    document.documentElement.style.setProperty('--side-bg', selectedTheme.sideBg);
}

function changeFont() {
    const fontValue = document.getElementById('fontSelect').value;
    document.documentElement.style.setProperty('--font-family', fontValue);
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const layoutParam = urlParams.get('layout');
    
    if (layoutParam) {
        const layoutSelect = document.getElementById('layoutSelect');
        // Check if the layout exists in our dropdown
        if (layoutSelect.querySelector(`option[value="${layoutParam}"]`)) {
            layoutSelect.value = layoutParam;
        }
    }

    // Initial Calls (Moved inside DOMContentLoaded for safety)
    changeLayout();
    changeTheme();
    changeFont();
    update();
});


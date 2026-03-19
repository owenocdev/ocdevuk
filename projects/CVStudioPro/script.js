let cvData = { work: [], edu: [], skills: [], achieve: [] };
let currentOrder = ['work', 'edu', 'skills', 'achieve', 'extra'];

// Initialize Sortable for sections
Sortable.create(document.getElementById('drag-list'), {
    animation: 150,
    onEnd: function(evt) {
        currentOrder = Array.from(evt.from.children).map(item => item.getAttribute('data-id'));
        update();
    }
});

function setLayout(mode) {
    document.getElementById('cv-canvas').className = 'layout-' + mode;
    document.getElementById('btn-sidebar').classList.toggle('active', mode === 'sidebar');
    document.getElementById('btn-top').classList.toggle('active', mode === 'top');
}

function addItem(type) {
    const id = Date.now();
    let html = `<div class="repeater-item" id="item-${id}"><button class="remove-btn" onclick="removeItem('${type}', ${id})">✕</button>`;
    
    if (type === 'edu') {
        html += `<input type="text" placeholder="Education Centre" oninput="updateItem('edu',${id},'name',this.value)">
                 <div class="date-grid">
                    <input type="text" placeholder="Start" oninput="updateItem('edu',${id},'start',this.value)">
                    <input type="text" id="end-${id}" placeholder="End/Present" oninput="updateItem('edu',${id},'end',this.value)">
                 </div>
                 <div id="qual-list-${id}" class="nested-repeater"></div>
                 <button class="add-btn" onclick="addQual(${id})">+ Qual & Grade</button>`;
        cvData.edu.push({ id, name: '', start: '', end: '', quals: [] });
    } else if (type === 'work') {
        html += `<input type="text" placeholder="Company" oninput="updateItem('work',${id},'title',this.value)">
                 <input type="text" placeholder="Date" oninput="updateItem('work',${id},'start',this.value)">
                 <textarea placeholder="Description..." oninput="updateItem('work',${id},'desc',this.value)"></textarea>`;
        cvData.work.push({ id, title: '', start: '', desc: '' });
    } else {
        html += `<input type="text" placeholder="Title" oninput="updateItem('${type}',${id},'title',this.value)">
                 <textarea placeholder="Details..." oninput="updateItem('${type}',${id},'desc',this.value)"></textarea>`;
        cvData[type].push({ id, title: '', desc: '' });
    }
    
    document.getElementById(`${type}-inputs`).insertAdjacentHTML('beforeend', html + `</div>`);
    update();
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
    update();
}

function updateQual(eId, qId, f, v) { 
    cvData.edu.find(i => i.id === eId).quals.find(q => q.id === qId)[f] = v; 
    update(); 
}

function removeQual(eId, qId) { 
    const edu = cvData.edu.find(i => i.id === eId);
    edu.quals = edu.quals.filter(q => q.id !== qId);
    document.getElementById(`qual-${qId}`).remove();
    update(); 
}

function updateItem(t, id, f, v) { 
    cvData[t].find(i => i.id === id)[f] = v; 
    update(); 
}

function removeItem(t, id) { 
    cvData[t] = cvData[t].filter(i => i.id !== id); 
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
            if (val !== "") {
                container.innerHTML += `<div><h3>Additional Info</h3><div class="desc-text">${val}</div></div>`;
            }
            return;
        }

        let label = document.querySelector(`.drag-item[data-id="${secId}"]`).innerText.trim();
        let html = `<div><h3>${label}</h3>`;
        let hasContent = false;

        if (secId === 'work' && cvData.work.length > 0) {
            hasContent = true;
            html += cvData.work.map(i => `<div style="margin-bottom:10px;"><div class="entry-header"><span>${i.title}</span><span class="date-text">${i.start}</span></div><div class="desc-text">${i.desc}</div></div>`).join('');
        } else if (secId === 'edu' && cvData.edu.length > 0) {
            hasContent = true;
            html += cvData.edu.map(i => `<div style="margin-bottom:12px;"><div class="entry-header"><span>${i.name}</span><span class="date-text">${i.start} — ${i.end}</span></div>${i.quals.map(q => `<div class="qual-row"><span>${q.title}</span><strong>${q.grade}</strong></div>`).join('')}</div>`).join('');
        } else if (cvData[secId] && cvData[secId].length > 0) {
            hasContent = true;
            html += cvData[secId].map(i => `<div style="margin-bottom:8px;"><strong>${i.title}</strong><div class="desc-text">${i.desc}</div></div>`).join('');
        }

        if (hasContent) container.innerHTML += html + `</div>`;
    });
    lucide.createIcons();
}

function downloadPDF() {
    const canvas = document.getElementById('cv-canvas');
    const indicators = document.querySelectorAll('.no-pdf');
    indicators.forEach(el => el.style.display = 'none');

    html2pdf().from(canvas).set({ 
        margin: 0, 
        filename: 'Professional_CV.pdf', 
        html2canvas: { scale: 3 }, 
        jsPDF: { unit: 'px', format: [794, Math.max(1123, canvas.offsetHeight)], hotfixes: ['px_scaling'] } 
    }).save().then(() => {
        indicators.forEach(el => el.style.display = 'block');
    });
}

// Initial Call
update();
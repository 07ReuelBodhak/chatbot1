function displayMessage() {
    var options = document.getElementById('documents').value;
    var optionContainer = document.querySelector('.option-container');
    optionContainer.innerHTML = '';
    var optionDiv = document.createElement('div');
    switch (options) {
        case "1":
            let labels1 = [
                'Proof of age (any 1): (birth certificate, Passport, school leaving certificate)',
                'Proof of Address (any 1): (Aadhar Card, Passport, VoterID)',
                'Application Form (Form 4)',
                'Passport size photograph 3.',
                'Driving school certificate (for transport vehicle licences)'
            ];
            num = labels1.length;
            optionDiv.innerHTML = `
            <div class="option-list py-3">
            <h2 class="heading mt-2"> Driving License </h2>
            <form action="/pay" method="post" id="form">
            <input type="hidden" name="documentName" value="Driving License">
            <input type="hidden" name="documentPrice" value=100>
           ${(() => {
                    let content = '';
                    for (let i = 0; i < labels1.length; i++) {
                        const id = `imageInput${i + 1}`;
                        content += `
                    <label for=${id} class="message mt-2"> ${i + 1}.${labels1[i]}</label>
                    <input required type="file" id="${id}" class="form-control mb-3 mt-2" accept="image/*"/>
                    `;
                    }
                    return content;
                })()}
            <button onclick="saveImage(num,event)" type="button" class="btn btn-primary mt-2"> submit</button>
            </form>
            </div>
            `;
            optionContainer.appendChild(optionDiv);
            break;
        case "2":
            let labels2 = ["Proof of Identity (any 1): (Passport,VoterID,Birth Certificate)",
                "Proof of Address(any one): (Addhar Card,passport,Driving License)",
                "Date of Birth proof(any one): (Birth Certificate, School leaving certificate, PAN Card)",
                "Passport Size Photograph: (Recent color photographs with a white background)",
                "Additional Document(if applicable) : Marriage certificate (for married applicants), Divorce decree (if divorced), Name change document (if applicable)",
                "10th Marksheet.",
                "12th Marksheet."
            ];
            num = labels2.length;
            optionDiv.innerHTML = `
            <div class="option-list py-3">
            <h2 class="heading mt-2"> Passport </h2>
            <form action="/pay" method="post" id="form">
            <input type="hidden" name="documentName" value="Passport">
            <input type="hidden" name="documentPrice" value=100>
            ${(() => {
                    let content = ''
                    for (i = 0; i < labels2.length; i++) {
                        const id = `imageInput${i + 1}`;
                        content += `
                    <label for=${id} class="message mt-2"> ${i + 1}.${labels2[i]}</label>
                    <input required type="file" id="${id}" class="form-control mb-3 mt-2" accept="image/*"/>
                    `;
                    }
                    return content;
                })()}
                <button onclick="saveImage(num,event)" type="button" class="btn btn-primary mt-2"> submit</button>            
            </div>
            `;
            optionContainer.appendChild(optionDiv)
            break;
        case "3":
            let labels3 = [
                "Proof of Identity (any 1): (Passport,VoterID,Birth Certificate)",
                "Proof of Address(any one): (Addhar Card,passport,Driving License)",
                "Bank Statement.",
                "Passport Size Photograph."
            ];
            num = labels3.length;
            optionDiv.innerHTML = `
            <div class="option-list py-3">
            <h2 class="heading mt-2"> Pancard </h2>
            <form action="/pay" method="post" id="form">
            <input type="hidden" name="documentName" value="Pancard">
            <input type="hidden" name="documentPrice" value=100>
            ${(() => {
                    let content = ''
                    for (i = 0; i < labels3.length; i++) {
                        const id = `imageInput${i + 1}`;
                        content += `
                    <label for=${id} class="message mt-2"> ${i + 1}.${labels3[i]}</label>
                    <input type="file" required id="${id}" class="form-control mb-3 mt-2" accept="image/*"/>
                    `;
                    }
                    return content;
                })()}
                <button onclick="saveImage(num,event)" type="button" class="btn btn-primary mt-2"> submit</button>            </form>
            </div>
            `;
            optionContainer.appendChild(optionDiv)
            break;
        case "4":
            let labels4 = [
                " Proof of Identity (any one of them): (PAN Card,Passport)",
                "proof of Address(ane one of them): (Passport,Addhar card,voter ID)",
                "Proof of caste (any one of them): (Caste Certificate of Parent or relatives, Affidavit declaring the caste of the applicant)",
                "Income Certificate.",
                "School or college Bonafide Certificate.",
                "Passport Size Photograph.",
                "Ration Card.",
                "Affidavit (An affidavit affirming the caste, duly signed by a notary or executive magistrate)"
            ];
            num = labels4.length;
            optionDiv.innerHTML = `
            <div class="option-list py-3">
            <h2 class="heading mt-2"> Caste Certificate </h2>
            <form action="/pay" method="post" id="form">
            <input type="hidden" name="documentName" value="Caste Certificate">
            <input type="hidden" name="documentPrice" value=100>
            ${(() => {
                    let content = ''
                    for (i = 0; i < labels4.length; i++) {
                        const id = `imageInput${i + 1}`;
                        content += `
                    <label for=${id} class="message mt-2"> ${i + 1}.${labels4[i]}</label>
                    <input type="file" required id="${id}" class="form-control mb-3 mt-2" accept="image/*"/>
                    `;
                    }
                    return content;
                })()}
                <button onclick="saveImage(num,event)" type="button" class="btn btn-primary mt-2"> submit</button>            </form>
            </div>
            `;
            optionContainer.appendChild(optionDiv)
            break;
        case "5":
            let labels5 = [
                "Proof of Identity (any 1): (Passport,VoterID,Birth Certificate)",
                "Proof of Address(any one): (Addhar Card,passport,Driving License)",
                "Other Document(any one): (Ration Card/water bill/electric bill)",
                "Age Proof(in case of minor)(any one): (school leaving certificate,bonafide certificate)",
                "Residence Proof(any one): (Residence Proof by Talathi, Residence Proof by Gram Sevak)",
                "Mandatory Document(self decleration)"
            ];
            num = labels5.length;
            optionDiv.innerHTML = `
            <div class="option-list py-3">
            <h2 class="heading mt-2"> Nationality </h2>
            <form action="/pay" method="post" id="form">
            <input type="hidden" name="documentName" value="Nationality">
            <input type="hidden" name="documentPrice" value=100>
            ${(() => {
                    let content = ''
                    for (i = 0; i < labels5.length; i++) {
                        const id = `imageInput${i + 1}`;
                        content += `
                    <label for=${id} class="message mt-2"> ${i + 1}.${labels5[i]}</label>
                    <input type="file" required id="${id}" class="form-control mb-3 mt-2" accept="image/*"/>
                    `;
                    }
                    return content;
                })()}
                <button onclick="saveImage(num,event)" type="button" class="btn btn-primary mt-2"> submit</button>            </form>
            </div>
            `;
            optionContainer.appendChild(optionDiv)
            break;
        case "6":
            let labels6 = [
                "Proof of Identity (any 1): (Passport,VoterID,Birth Certificate)",
                "Proof of Address(any one): (Addhar Card,passport,Driving License)",
                "Other Document(any one): (Ration Card/water bill/electric bill)",
                "Age Proof(in case of minor)(any one): (school leaving certificate,bonafide certificate)",
                "Residence Proof(any one): (Residence Proof by Talathi, Residence Proof by Gram Sevak)",
                "Mandatory Document(self decleration)"
            ];
            num = labels6.length;
            optionDiv.innerHTML = `
            <div class="option-list py-3">
            <h2 class="heading mt-2"> Domicile </h2>
            <form action="/pay" method="post" id="form">
            <input type="hidden" name="documentName" value="Domicile">
            <input type="hidden" name="documentPrice" value=100>
            ${(() => {
                    let content = ''
                    for (i = 0; i < labels6.length; i++) {
                        const id = `imageInput${i + 1}`;
                        content += `
                    <label for=${id} class="message mt-2"> ${i + 1}.${labels6[i]}</label>
                    <input type="file" required id="${id}" class="form-control mb-3 mt-2" accept="image/*"/>
                    `;
                    }
                    return content;
                })()}
                <button onclick="saveImage(num,event)" type="button" class="btn btn-primary mt-2"> submit</button>            </form>
            </div>
            `;
            optionContainer.appendChild(optionDiv)
            break;
        case "7":
            let labels7 = [
                "Proof of identity(any 1): (Pan card,Passport,Addhar card)",
                "Proof of Address(any 1): (Passportm Addhar card,ration card, voter ID)",
                "Other Documet(any one):( Property tax receipt, Proof of caste of a relative, If proof of father's caste not available, a relative's caste certificate and genealogical affidavit with details of relation to relative)",
                "Income Proof.",
                "Affidavit for caste.",
                "proof of caste itself."
            ];
            num = labels7.length;
            optionDiv.innerHTML = `
            <div class="option-list py-3">
            <h2 class="heading mt-2"> Non-creamy layer </h2>
            <form action="/pay" method="post" id="form">
            <input type="hidden" name="documentName" value="Non-creamy Layer">
            <input type="hidden" name="documentPrice" value=100>
            ${(() => {
                    let content = ''
                    for (i = 0; i < labels7.length; i++) {
                        const id = `imageInput${i + 1}`;
                        content += `
                    <label for=${id} class="message mt-2"> ${i + 1}.${labels7[i]}</label>
                    <input type="file" required id="${id}" class="form-control mb-3 mt-2" accept="image/*"/>
                    `;
                    }
                    return content;
                })()}
                <button onclick="saveImage(num,event)" type="button" class="btn btn-primary mt-2"> submit</button>            </form>
            </div>
            `;
            optionContainer.appendChild(optionDiv)
            break;
        case "8":
            let labels8 = [
                "Mandatory : Salary Statement for last 12 months from DDO (Government Employee) Or Certificate from BDO (For Rural areas) Or Certificate from DAO, DHO, DVO, etc (For persons having income from Agriculture, Horticulture and Veterinary Sources). (APST Non-Government Employee) Or IT Return/ Form 16 (Non APST Non-Government Employee)",
                "Age of Proof (any one): (Pan card, Birth Certificate,School Leaving Certificate)",
                "Address Proof (any one): (Addhar card, voter ID, Ration Card)",
                "Proof of identity(any 1): (Pan card,Passport,Addhar card)"
            ];
            num = labels8.length;
            optionDiv.innerHTML = `
            <div class="option-list py-3">
            <h2 class="heading mt-2"> Income Certificate </h2>
            <form action="/pay" method="post" id="form">
            <input type="hidden" name="documentName" value="Income Certificate">
            <input type="hidden" name="documentPrice" value=100>
            ${(() => {
                    let content = ''
                    for (i = 0; i < labels8.length; i++) {
                        const id = `imageInput${i + 1}`;
                        content += `
                    <label for=${id} class="message mt-2"> ${i + 1}.${labels8[i]}</label>
                    <input type="file" required id="${id}" class="form-control mb-3 mt-2" accept="image/*"/>
                    `;
                    }
                    return content;
                })()}
                <button onclick="saveImage(num,event)" type="button" class="btn btn-primary mt-2"> submit</button>            </form>
            </div>
            `;
            optionContainer.appendChild(optionDiv)
            break;
        default:
            break;

    }
}

function saveImage(num, event) {
    console.log('function is called')
    event.preventDefault();
    var formData = new FormData();
    var isValid = true;

    formData.append('length', num);
    for (let i = 0; i < num; i++) {
        let img = document.getElementById(`imageInput${i + 1}`);
        var file = img.files[0];

        if (img.hasAttribute('required') && (!file || file.size === 0)) {
            isValid = false;
            alert(`Please select a file for ${img.getAttribute('id')}`);
            break;
        }

        if (file) {
            console.log(`File selected for ${img.getAttribute('id')}:`, file);
            formData.append('image', file);
        }
        document.getElementById(`imageInput${i + 1}`).value = "";
    }

    if (isValid) {
        fetch('/pay', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                document.getElementById('form').submit()
            })
            .then(data => {
                console.log('Success:', data);
            })
            .catch(error => {
                console.log(error);
            });
    }
}

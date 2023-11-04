document.getElementById("fileInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const xmlData = e.target.result;
            parseXMLData(xmlData);
        };
        reader.readAsText(file);
    }
});

function parseXMLData(xmlData) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");

    // Inicializace slovníků pro uchování výsledků
    const souctyModeluCenaBezDPH = {};
    const souctyModeluCenaSDPH = {};

    // Projděte všechny modely_auta v XML
    const modelAuta = xmlDoc.querySelectorAll("model_auta");
    modelAuta.forEach((model) => {
        const nazevModelu = model.querySelector("Název_modelu").textContent;
        const cenaBezDPH = parseFloat(model.querySelector("Cena").textContent);
        const dph = parseFloat(model.querySelector("DPH").textContent);
        const datumProdeje = new Date(model.querySelector("Datum_prodeje").textContent);

        // Zkontrolujte, zda je datum prodeje víkendový
        if (datumProdeje.getDay() === 0 || datumProdeje.getDay() === 6) {
            // Přidejte cenu vozidla k celkové ceně bez DPH pro tento model
            if (souctyModeluCenaBezDPH[nazevModelu]) {
                souctyModeluCenaBezDPH[nazevModelu] += cenaBezDPH;
            } else {
                souctyModeluCenaBezDPH[nazevModelu] = cenaBezDPH;
            }

            // Vypočítejte cenu s DPH a přidejte ji k celkové ceně s DPH pro tento model
            const cenaSDPH = cenaBezDPH * (1 + dph / 100);
            if (souctyModeluCenaSDPH[nazevModelu]) {
                souctyModeluCenaSDPH[nazevModelu] += cenaSDPH;
            } else {
                souctyModeluCenaSDPH[nazevModelu] = cenaSDPH;
            }
        }
    });

    // Vytvořte výsledkový seznam modelů
    const vysledky = [];
    for (const model in souctyModeluCenaBezDPH) {
        vysledky.push({
            Model: model,
            CenaBezDPH: souctyModeluCenaBezDPH[model],
            CenaSDPH: souctyModeluCenaSDPH[model],
        });
    }

    // Vymažte existující obsah tabulky s výsledky
    const resultDataGrid = document.getElementById("resultDataGrid");
    resultDataGrid.innerHTML = "";

    // Naplňte tabulku s výsledky
    vysledky.forEach((vysledek) => {
        const row = resultDataGrid.insertRow(-1);
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        cell1.innerHTML = vysledek.Model;
        cell2.innerHTML = vysledek.CenaBezDPH;
        cell3.innerHTML = vysledek.CenaSDPH;
    });
}
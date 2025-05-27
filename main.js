import { getCookie } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.6/cookie.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.6/api.js";

export function getBiasa(target_url, responseFunction) {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");

    let requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: myHeaders
    };

    fetch(target_url, requestOptions)
        .then(response => {
            const status = response.status;
            return response.text().then(result => {
                const parsedResult = JSON.parse(result);
                responseFunction({ status, data: parsedResult });
            });
        })
        .catch(error => console.log('error', error));
};

export function postBiasa(target_url, datajson, responseFunction) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");

    var raw = JSON.stringify(datajson);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(target_url, requestOptions)
        .then(response => {
            const status = response.status;
            return response.text().then(result => {
                const parsedResult = JSON.parse(result);
                responseFunction({ status, data: parsedResult });
            });
        })
        .catch(error => console.log('error', error));
};

const getSystemInfo = async () => {
    document.addEventListener("DOMContentLoaded", async () => {
        await postBiasa("https://asia-southeast2-awangga.cloudfunctions.net/domyid/api/tracker/testing", {}, responseFunction);
    });
};

function responseFunction(result) {
    if (result.status == 200) {
        const data = result.data.data;
        const pengunjungPerHari = {};

        data.forEach(item => {
            const tanggal = new Date(item.tanggal_ambil).toISOString().split('T')[0]; // Ambil yyyy-mm-dd
            if (pengunjungPerHari[tanggal]) {
                pengunjungPerHari[tanggal]++;
            } else {
                pengunjungPerHari[tanggal] = 1;
            }
        });

        const labels = Object.keys(pengunjungPerHari);
        const jumlah = Object.values(pengunjungPerHari);

        tampilkanChart(labels, jumlah);
    }
}

function tampilkanChart(labels, data) {
    const ctx = document.getElementById('pengunjungChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar', // Bisa diganti jadi 'line' jika ingin
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Pengunjung',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    precision: 0
                }
            }
        }
    });
}

getSystemInfo();
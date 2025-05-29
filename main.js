import { runAfterDOM, onClicks } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.6/element.js";

let pengunjungChartInstance = null;

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

function loadChart(howLong) {
    const url = `https://asia-southeast2-awangga.cloudfunctions.net/domyid/api/tracker/testing?how_long=${howLong}`;
    postBiasa(url, {}, (result) => responseFunction(result, howLong));
};

function handleButtonClick(buttonElement) {
    const range = buttonElement.getAttribute('data-range');
    loadChart(range);
}

runAfterDOM(() => {
    // onClicks('tombol-tracker', handleButtonClick);
    // loadChart("last_day");
    console.log("=== Browser Info ===");

    console.log("User-Agent:", navigator.userAgent);
    console.log("Bahasa browser:", navigator.language || navigator.userLanguage);
    console.log("Resolusi layar:", screen.width + "x" + screen.height);
    console.log("Ukuran jendela:", window.innerWidth + "x" + window.innerHeight);
    console.log("Timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.log('ontouchstart' in window);
    const hasTouchStart = 'ontouchstart' in window;
    document.getElementById('touchResult').textContent = hasTouchStart;
});

function responseFunction(result, howLong) {
    if (result.status == 200) {
        const data = result.data.data;

        if (howLong === "last_day") {
            const nowUTC = new Date();
            const now = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);
            const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            const pengunjungPerJam = Array(24).fill(0);
            const labels = [];

            for (let i = 0; i < 24; i++) {
                const hour = new Date(startTime.getTime() + i * 60 * 60 * 1000);
                labels.push(hour.getHours().toString().padStart(2, '0') + ':00');
            }

            data.forEach(item => {
                const waktuUTC = new Date(item.tanggal_ambil);
                const waktu = new Date(waktuUTC.getTime() + 7 * 60 * 60 * 1000);

                if (waktu >= startTime && waktu <= now) {
                    const diffMs = waktu - startTime;
                    const jamIndex = Math.floor(diffMs / (60 * 60 * 1000));

                    if (jamIndex >= 0 && jamIndex < 24) {
                        pengunjungPerJam[jamIndex]++;
                    }
                }
            });

            tampilkanChart(labels, pengunjungPerJam);

        } else {
            const pengunjung = {};
            data.forEach(item => {
                const waktuUTC = new Date(item.tanggal_ambil);
                const waktu = new Date(waktuUTC.getTime() + 7 * 60 * 60 * 1000);

                const key = waktu.toISOString().split('T')[0];
                pengunjung[key] = (pengunjung[key] || 0) + 1;
            });

            const allDates = generateDateRange(Object.keys(pengunjung), howLong);
            const labels = allDates;
            const jumlah = allDates.map(tgl => pengunjung[tgl] || 0);

            tampilkanChart(labels, jumlah);
        }
    }
};

function generateDateRange(tanggalArray, howLong) {
    if (howLong === 'last_week' || howLong === 'last_month') {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        let start;

        if (howLong === 'last_week') {
            start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        } else {
            start = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
        }

        const dateList = [];
        const dateIter = new Date(start);

        while (dateIter <= now) {
            dateList.push(dateIter.toISOString().split('T')[0]);
            dateIter.setDate(dateIter.getDate() + 1);
        }

        return dateList;
    }
    
    const sortedDates = tanggalArray.slice().sort();
    const start = new Date(sortedDates[0]);
    const end = new Date(sortedDates[sortedDates.length - 1]);

    const dateList = [];
    const iterDate = new Date(start);

    while (iterDate <= end) {
        dateList.push(iterDate.toISOString().split('T')[0]);
        iterDate.setDate(iterDate.getDate() + 1);
    }

    return dateList;
};

function tampilkanChart(labels, data) {
    const ctx = document.getElementById('pengunjungChart').getContext('2d');

    if (pengunjungChartInstance !== null) {
        pengunjungChartInstance.destroy();
    }

    pengunjungChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Pengunjung',
                data: data,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
};
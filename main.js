import { getCookie, setCookieWithExpireHour } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.6/cookie.js";

const postBiasa = async (target_url, datajson, responseFunction) => {
    try {
        const myHeaders = new Headers({
            "Content-Type": "application/json"
        });

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(datajson),
            redirect: 'follow'
        };

        const response = await fetch(target_url, requestOptions);
        const status = response.status;
        const result = await response.json();

        responseFunction({ status, data: result });
    } catch (error) {
        console.error('Error:', error);
    }
};

const responseFunction = ({ status }) => {
    console.log(status === 200 ? "Berhasil" : "Error");
};

const getSystemInfo = async () => {
    document.addEventListener("DOMContentLoaded", async () => {
        try {
            const response = await fetch("https://api.ipify.org?format=json");
            const { ip } = await response.json();
            let datajson = {
                ipv4: ip,
                url: window.location.href,
            };

            await postBiasa("https://asia-southeast2-awangga.cloudfunctions.net/domyid/api/trackertesting", datajson, responseFunction);
        } catch (error) {
            console.error("Error mengambil IP dari ipify:", error);
        }
    });
};

getSystemInfo();
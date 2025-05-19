import { getCookie, setCookieWithExpireHour } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.6/cookie.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.6/api.js";

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

        responseFunction({ status, data: result, originalData: datajson });
    } catch (error) {
        console.error('Error:', error);
    }
};

const getSystemInfo = async () => {
    document.addEventListener("DOMContentLoaded", async () => {
        if (getCookie("Tracker")) {
            console.log("Data sudah dikirim dalam 24 jam terakhir, tidak mengirim ulang.");
            return;
        }
        try {
            const response = await fetch("https://api.ipify.org?format=json");
            const { ip } = await response.json();
            let hostnameWeb = window.location.hostname;
            const urlHref = window.location.href;
            let datajson

            if (hostnameWeb === "t.if.co.id") {
                const pathname = window.location.pathname;
                hostnameWeb = `${hostnameWeb}${pathname}`;
                datajson = {
                    ipv4: ip,
                    hostname: hostnameWeb,
                    url: urlHref,
                    browser: navigator.userAgent
                };
                await postBiasa("https://asia-southeast2-awangga.cloudfunctions.net/domyid/api/tracker/token", datajson, responseFunction);
            } else {
                datajson = {
                    ipv4: ip,
                    hostname: hostnameWeb,
                    url: urlHref,
                    browser: navigator.userAgent
                };
                await postBiasa("https://asia-southeast2-awangga.cloudfunctions.net/domyid/api/tracker/token", datajson, responseFunction);
            }
        } catch (error) {
            console.error("Error mengambil IP dari ipify:", error);
        }
    });
};

function responseFunction(result) {
    if (result.status == 200) {
        setCookieWithExpireHour("Tracker", result.data.response, 24);

        const trackerToken = getCookie("Tracker");
        if (trackerToken) {
            postJSON("https://asia-southeast2-awangga.cloudfunctions.net/domyid/api/tracker/testing", result.originalData, responseFunction2, "Tracker", trackerToken
            );
        }
    }
}

function responseFunction2(result) {
    if (result.status == 200) {
        console.log("Berhasil")
    } else {
        console.log("Error")
    }
}

getSystemInfo();
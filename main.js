import { getCookie } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.6/cookie.js";
import { postJSON } from "https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.6/api.js";

const postBiasa = async (target_url, responseFunction) => {
    try {
        const myHeaders = new Headers({
            "Content-Type": "application/json"
        });

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
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
        await postBiasa("https://asia-southeast2-awangga.cloudfunctions.net/domyid/api/tracker/testing", responseFunction);
    });
};

function responseFunction(result) {
    if (result.status == 200) {
        console.log(result.data.response)
        console.log(result.data.data)
        const trackerToken = getCookie("Tracker");
        if (trackerToken) {
            postJSON("https://asia-southeast2-awangga.cloudfunctions.net/domyid/api/tracker/testing", result.originalData, responseFunction2, "Tracker", trackerToken
            );
        }
    }
}


getSystemInfo();
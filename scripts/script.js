//========================
// 病院データ
//========================

const hospitals = [
    {
        name: "むらかみ診療所",
        type: "内科・小児科",
        tel: "0152-12-3456",
        icon: "＋",
        color: "green-bg"
    },
    {
        name: "あさひ総合病院",
        type: "総合診療科",
        tel: "0152-98-7654",
        icon: "＋",
        color: "blue-bg"
    },
    {
        name: "やすらぎクリニック",
        type: "心療内科・精神科",
        tel: "0152-22-3344",
        icon: "＋",
        color: "red-bg"
    },
    {
        name: "北の町リハビリセンター",
        type: "整形外科・リハビリ",
        tel: "0152-55-9000",
        icon: "歩",
        color: "orange-bg"
    }
];

//========================
// DOM取得
//========================

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll("nav a");

const hospitalList = document.getElementById("hospitalList");
const homeHospitals = document.getElementById("homeHospitals");
const rideTo = document.getElementById("rideTo");

//========================
// LocalStorage
//========================

function getReservations() {
    return JSON.parse(
        localStorage.getItem("reservations") || "[]"
    );
}

function saveReservations(data) {
    localStorage.setItem(
        "reservations",
        JSON.stringify(data)
    );
}

//========================
// 画面切替
//========================

function showPage(id, link = null) {

    pages.forEach(page =>
        page.classList.remove("active")
    );

    document
        .getElementById(id)
        .classList.add("active");

    navLinks.forEach(link =>
        link.classList.remove("active")
    );

    if (link) {
        link.classList.add("active");
    }

    if (id === "list") {
        renderReservations();
    }
}

//========================
// ナビゲーション
//========================

function go(id) {

    const pageMap = {
        home: 0,
        ride: 1,
        check: 2,
        list: 3,
        medicine: 4,
        hospitals: 5,
        notice: 6
    };

    showPage(
        id,
        navLinks[pageMap[id]]
    );
}

//========================
// 病院カード生成
//========================

function createHospitalCard(hospital) {

    return `
        <div class="hospital">

            <div class="mark ${hospital.color}">
                ${hospital.icon}
            </div>

            <div>

                <b>${hospital.name}</b>

                <p>
                    ${hospital.type}
                    /
                    ${hospital.tel}
                </p>

            </div>

            <button
                onclick="alert('${hospital.name}\n${hospital.type}\n電話：${hospital.tel}')">

                詳細を見る

            </button>

        </div>
    `;
}

//========================
// 病院一覧描画
//========================

function renderHospitals() {

    const html = hospitals
        .map(createHospitalCard)
        .join("");

    hospitalList.innerHTML = html;
    homeHospitals.innerHTML = html;

    rideTo.innerHTML =
        '<option value="">行き先を選択</option>' +
        hospitals
            .map(h =>
                `<option value="${h.name}">
                    ${h.name}
                </option>`
            )
            .join("");
}

//========================
// 初期化
//========================

renderHospitals();

//========================
// 送迎予約
//========================

const rideForm = document.getElementById("rideForm");
const rideResult = document.getElementById("rideResult");

rideForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const reservations = getReservations();

    const reservation = {
        type: "送迎",
        name: document.getElementById("rideName").value,
        from: document.getElementById("rideFrom").value,
        to: document.getElementById("rideTo").value,
        date: document.getElementById("rideDate").value,
        time: document.getElementById("rideTime").value,
        returnNeed: document.getElementById("needReturn").value,
        returnTime: document.getElementById("returnTime").value
    };

    reservations.push(reservation);
    saveReservations(reservations);

    const backMessage =
        reservation.returnNeed === "帰りの送迎も予約する"
            ? `帰り：${reservation.returnTime || "診察後に連絡"}に迎え予定`
            : "帰り：予約なし";

    rideResult.style.display = "block";
    rideResult.innerHTML = `
        <strong>${reservation.name}さんの送迎予約を受け付けました。</strong><br>
        行き：${reservation.date} ${reservation.time}<br>
        ${backMessage}<br>
        経路：${reservation.from} → ${reservation.to}<br>
        AI判定：同じ方面の利用者と合わせて効率のよい送迎ルートを作成します。
    `;

    rideForm.reset();

});

//========================
// AI問診
//========================

const checkForm = document.getElementById("checkForm");
const checkResult = document.getElementById("checkResult");

checkForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const name = document.getElementById("patientName").value;
    const age = Number(document.getElementById("age").value);
    const symptom = document.getElementById("symptom").value;

    let level = "低";
    let hospital = "むらかみ診療所";
    let color = "#16a34a";
    let advice = "まずは近くの診療所に相談してください。";

    if (
        ["胸","息","強い痛み","倒れ","意識"]
        .some(word => symptom.includes(word))
    ) {

        level = "高";
        hospital = "あさひ総合病院";
        color = "#dc2626";
        advice =
            "早めの受診が必要です。送迎よりも救急相談を優先してください。";

    }

    else if (
        ["熱","めまい","吐き気","痛い"]
        .some(word => symptom.includes(word))
    ) {

        level = "中";
        hospital = "むらかみ診療所";
        color = "#f97316";
        advice =
            "当日中の相談をおすすめします。必要に応じて送迎を予約してください。";

    }

    else if (
        ["膝","腰","リハビリ"]
        .some(word => symptom.includes(word))
    ) {

        level = "中";
        hospital = "北の町リハビリセンター";
        color = "#f97316";
        advice =
            "通院送迎を利用した受診をおすすめします。";

    }

    else if (
        ["眠れない","不安","気分"]
        .some(word => symptom.includes(word))
    ) {

        level = "中";
        hospital = "やすらぎクリニック";
        color = "#f97316";
        advice =
            "オンライン相談または専門病院への紹介が考えられます。";

    }

    if (age >= 75) {
        advice +=
            "<br>高齢者のため、家族通知・行き帰りの送迎予約をおすすめします。";
    }

    checkResult.style.display = "block";
    checkResult.innerHTML = `
        <strong>${name}さんの問診結果</strong><br>

        <span style="font-size:20px;font-weight:bold;color:${color}">
            緊急度：${level}
        </span>

        <br>

        推奨受診先：${hospital}

        <br>

        ${advice}

        <br><br>

        <button onclick="go('ride')">
            この受診先で送迎予約へ
        </button>
    `;

});

//========================
// 薬の配達予約
//========================

const medicineForm = document.getElementById("medicineForm");
const medicineResult = document.getElementById("medicineResult");

medicineForm.addEventListener("submit", (e) => {

    e.preventDefault();

    const reservations = getReservations();

    const reservation = {

        type: "薬配達",

        name: document.getElementById("medName").value,

        pharmacy: document.getElementById("pharmacy").value,

        address: document.getElementById("medAddress").value,

        date: document.getElementById("medDate").value,

        time: document.getElementById("medTime").value,

        memo: document.getElementById("medMemo").value

    };

    reservations.push(reservation);

    saveReservations(reservations);

    medicineResult.style.display = "block";

    medicineResult.innerHTML = `
        <strong>${reservation.name}さんの薬の配達予約を受け付けました。</strong><br>

        薬局：${reservation.pharmacy}<br>

        配達日：${reservation.date} ${reservation.time}<br>

        配達先：${reservation.address}<br>

        備考：${reservation.memo || "なし"}<br>

        AI判定：通院送迎便や地域配送便と組み合わせて配達します。
    `;

    medicineForm.reset();

});

//========================
// 予約一覧
//========================

const reservationList =
    document.getElementById("reservationList");

function renderReservations() {

    const reservations = getReservations();

    if (reservations.length === 0) {

        reservationList.innerHTML =
            "<p>現在、予約はありません。</p>";

        return;
    }

    reservationList.innerHTML = reservations.map((r, i) => {

        if (r.type === "薬配達") {

            return `
                <div class="reservation">

                    <div class="mark orange-bg">
                        💊
                    </div>

                    <div>

                        <b>${r.name}さん：薬の配達</b>

                        <p>
                            ${r.date} ${r.time}
                            /
                            ${r.pharmacy}
                            →
                            ${r.address}
                        </p>

                    </div>

                    <button
                        class="small-btn danger"
                        onclick="deleteReservation(${i})">

                        削除

                    </button>

                </div>
            `;
        }

        const back =
            r.returnNeed === "帰りの送迎も予約する"
                ? ` / 帰り ${r.returnTime || "診察後"}`
                : "";

        return `
            <div class="reservation">

                <div class="mark green-bg">
                    🚐
                </div>

                <div>

                    <b>${r.name}さん：送迎</b>

                    <p>
                        ${r.date}
                        ${r.time}
                        ${back}
                        /
                        ${r.from}
                        →
                        ${r.to}
                    </p>

                </div>

                <button
                    class="small-btn danger"
                    onclick="deleteReservation(${i})">

                    削除

                </button>

            </div>
        `;

    }).join("");

}

function deleteReservation(index) {

    const reservations = getReservations();

    reservations.splice(index, 1);

    saveReservations(reservations);

    renderReservations();

}

function clearReservations() {

    if (confirm("すべての予約を削除しますか？")) {

        localStorage.removeItem("reservations");

        renderReservations();

    }

}
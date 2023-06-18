let form = document.getElementById("form");


let submit = document.getElementById("submit");
submit.addEventListener("click", (e) => {
    e.preventDefault();
    let obj = {
        name: form.name.value,
        email: form.email.value,
        address: form.address.value,
        city: form.city.value,
        state: form.state.value,
        zipcode: form.zipcode.value,
        name_on_card: form.name_on_card.value,
        card_number: form.card_number.value,
        expiry_month: form.expiry_month.value,
        expiry_year: form.expiry_year.value,
        cvv: form.cvv.value,
    }
    let flag = true;
    for (let key in obj) {
        if (!obj[key]) {
            flag = false;
            break;
        }
    }
    if(!flag){
        alert("Fill all the details");
    }else{
        addPayment(obj);
    }
})


async function addPayment(obj) {
    try {
        let result = await fetch("https://lazy-pear-lemur-shoe.cyclic.app/payment/add", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(obj)
        })
        console.log(result);
        if(result.ok){
            patchTimeSlot();
        }else{
            alert("Error in payment");
        }
    } catch (error) {
        console.log(error);
    }
}

async function patchTimeSlot() {
    let uniqueId = localStorage.getItem("profId");
    let slot = JSON.parse(localStorage.getItem("clicked-slot"));
    let obj = {
        uniqueId,
        date:+slot.date,
        time:slot.time
    }
    console.log(obj);
    try {
        let result = await fetch(`https://lazy-pear-lemur-shoe.cyclic.app/uptime`, {
            method: "PATCH",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify(obj)
        })
        console.log(result);
        if(result.ok){
            alert("slots booked successfully");
            let appArr = JSON.parse(localStorage.getItem("appointments")) || [];
            appArr.push(obj);
            localStorage.setItem("appointments",JSON.stringify(appArr));
            window.location.href="feedbackForm.html";
        }else{
            alert("Error in payment");
        }
    } catch (error) {
        console.log(error);
    }
}
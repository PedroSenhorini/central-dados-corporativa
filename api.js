document.addEventListener("DOMContentLoaded", () => {
    const userName = document.getElementById("user-name");
    const updatedInfo = document.getElementById("updated-info");

    if (userName) {
        userName.textContent = "Maria";
    }

    if (updatedInfo) {
        updatedInfo.textContent = "Atualizado hoje às 08:00";
    }
});

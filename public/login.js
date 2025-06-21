function loginAsAdmin() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const adminEmail = "admin@zewail.com"; // أو أي بريد أدمن معتمد

  if (email === adminEmail) {
    localStorage.setItem("isAdmin", "true");
    window.location.href = "admin.html";
  } else {
    alert("البريد غير مصرح له بالدخول كأدمن");
  }
}

function loginAsStudent() {
  localStorage.setItem("isAdmin", "false");
  window.location.href = "student.html"; // غيري اسم الصفحة لو مختلف
}

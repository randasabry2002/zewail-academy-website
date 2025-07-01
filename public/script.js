import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// تسجيل الطالب
window.registerStudent = async function () {
  const name = document.getElementById("studentName").value;
  const phone = document.getElementById("studentPhone").value;
  const grade = document.getElementById("studentGrade").value; // جديد
  const checkboxes = document.querySelectorAll(
    "input[name='teachers']:checked"
  );
  const selectedTeachers = Array.from(checkboxes).map((cb) => cb.value);

  if (!name || !phone || !grade || selectedTeachers.length === 0) {
    alert("من فضلك ادخل كل البيانات واختر مدرسًا واحدًا على الأقل");
    return;
  }

  await addDoc(collection(db, "students"), {
    name,
    phone,
    grade, // جديد
    teachers: selectedTeachers,
    createdAt: new Date().toISOString(),
  });

  alert("تم التسجيل بنجاح!");

  document.getElementById("studentName").value = "";
  document.getElementById("studentPhone").value = "";
  document.getElementById("studentGrade").value = ""; // جديد
  checkboxes.forEach((cb) => (cb.checked = false));

  if (typeof loadStudents === "function") loadStudents();
};

// تحميل المدرسين (بتحديث تلقائي من Firestore)
window.loadTeachers = function () {
  const container = document.getElementById("teacherCheckboxes");
  const filter = document.getElementById("teacherFilter");

  const teachersRef = collection(db, "teachers");

  onSnapshot(teachersRef, (snapshot) => {
    if (container) container.innerHTML = "";
    if (filter) filter.innerHTML = '<option value="">عرض الكل</option>';

    snapshot.forEach((docSnap) => {
      const teacher = docSnap.data();

      if (container) {
        const div = document.createElement("div");
        div.innerHTML = `
  <label class="teacher-card">
    <input type="checkbox" name="teachers" value="${teacher.name}">
    <div class="teacher-info">
      <span class="teacher-name">${teacher.name}</span>
      <span class="teacher-subject">${teacher.subject}</span>
    </div>
  </label>
`;
        container.appendChild(div);
      }

      if (filter) {
        const option = document.createElement("option");
        option.value = teacher.name;
        option.textContent = teacher.name;
        filter.appendChild(option);
      }
    });
  });
};

// إضافة مدرس
window.addTeacher = async function () {
  const name = document.getElementById("teacherName").value;
  const subject = document.getElementById("teacherSubject").value;

  if (!name || !subject) {
    alert("ادخل اسم المدرس والمادة");
    return;
  }

  await addDoc(collection(db, "teachers"), { name, subject });
  alert("تمت الإضافة!");

  document.getElementById("teacherName").value = "";
  document.getElementById("teacherSubject").value = "";

  if (typeof loadTeachers === "function") loadTeachers();
  if (typeof loadStudents === "function") loadStudents();
};

// حذف طالب
window.deleteStudent = async function (id) {
  await deleteDoc(doc(db, "students", id));
  loadStudents();
};

// تحميل الطلاب
window.loadStudents = function () {
  const container = document.getElementById("studentListContainer");
  const filterElement = document.getElementById("teacherFilter");

  const studentsRef = collection(db, "students");

  onSnapshot(studentsRef, (snapshot) => {
    const filterValue = filterElement?.value || "";

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>التليفون</th>
            <th>الصف</th>
            <th>المدرسين</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody id="studentTableBody"></tbody>
      </table>
    `;

    const tbody = document.getElementById("studentTableBody");

    snapshot.forEach((docSnap) => {
      const student = docSnap.data();

      if (filterValue && !student.teachers.includes(filterValue)) return;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${student.name}</td>
        <td>${student.phone}</td>
        <td>${student.grade || "—"}</td>
        <td>${student.teachers.join(", ")}</td>
        <td><button onclick="deleteStudent('${docSnap.id}')">🗑️</button></td>
      `;
      tbody.appendChild(tr);
    });
  });
};

// تحميل البيانات عند فتح الصفحة
window.addEventListener("DOMContentLoaded", () => {
  if (
    document.getElementById("teacherCheckboxes") ||
    document.getElementById("teacherFilter")
  ) {
    loadTeachers();
  }

  if (document.getElementById("studentListContainer")) {
    loadStudents();
  }
});

window.logout = function () {
  localStorage.removeItem("isAdmin");
  location.href = "index.html";
};

// تحميل قائمة المدرسين
window.loadTeachersAdmin = function () {
  const listContainer = document.getElementById("teacherList");
  const teachersRef = collection(db, "teachers");

  onSnapshot(teachersRef, (snapshot) => {
    listContainer.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const teacher = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement("div");
      card.className = "teacher-card-admin";
      card.innerHTML = `
        <strong>${teacher.name}</strong> - ${teacher.subject}
        <div class="actions">
          <button onclick="editTeacher('${id}', '${teacher.name}', '${teacher.subject}')">✏️ تعديل</button>
          <button onclick="deleteTeacher('${id}')">🗑️ حذف</button>
        </div>
      `;
      listContainer.appendChild(card);
    });
  });
};

// حذف مدرس
window.deleteTeacher = async function (id) {
  if (confirm("هل أنت متأكد من حذف هذا المدرس؟")) {
    await deleteDoc(doc(db, "teachers", id));
  }
};

// تعديل مدرس
window.editTeacher = function (id, currentName, currentSubject) {
  const name = prompt("اسم المدرس الجديد:", currentName);
  const subject = prompt("المادة الجديدة:", currentSubject);

  if (name && subject) {
    const teacherRef = doc(db, "teachers", id);
    updateDoc(teacherRef, { name, subject });
  }
};

// تحميل عند فتح الصفحة
if (document.getElementById("teacherList")) {
  loadTeachersAdmin();
}

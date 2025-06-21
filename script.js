import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// تسجيل الطالب
window.registerStudent = async function () {
  const name = document.getElementById("studentName").value;
  const phone = document.getElementById("studentPhone").value;
  const checkboxes = document.querySelectorAll(
    "input[name='teachers']:checked"
  );
  const selectedTeachers = Array.from(checkboxes).map((cb) => cb.value);

  if (!name || !phone || selectedTeachers.length === 0) {
    alert("من فضلك ادخل كل البيانات واختر مدرسًا واحدًا على الأقل");
    return;
  }

  await addDoc(collection(db, "students"), {
    name,
    phone,
    teachers: selectedTeachers,
    createdAt: new Date().toISOString(),
  });

  alert("تم التسجيل بنجاح!");

  document.getElementById("studentName").value = "";
  document.getElementById("studentPhone").value = "";
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
        div.innerHTML = `<label><input type="checkbox" name="teachers" value="${teacher.name}">${teacher.name} - ${teacher.subject}</label>`;
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

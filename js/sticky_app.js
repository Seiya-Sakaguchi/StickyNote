const params = new URLSearchParams(window.location.search);
const username = params.get("user");
const storageKey = `sticky_${username}`;
document.getElementById("userLabel").textContent = `ユーザー: ${username}`;



let taskId = 0;
// 移動可能な付箋を作成（作成した付箋にはIDを付与）
const createTaskElement = (text) => {
  const task = document.createElement("div");
  task.classList.add("task");
  task.textContent = text;
  task.draggable = true;
  task.id = `task-${taskId++}`;
  task.ondragstart = drag;
  return task;
};

const addTask = (type) => {
  const inputId = {
    low: "input-low",
    normal: "input-normal",
    high: "input-high"
  };
  const stickyColor = {
    low: "right-blue",
    normal: "right-green",
    high: "pink"
  };
// 業務レベルを取得して入力されたコメントが空文字じゃなければリターンする
  const input = document.getElementById(inputId[type]);
  const comment = input.value;
  if (comment.trim() === "") return;
// 動かせる付箋に色を追加
  const task = createTaskElement(comment);
  task.classList.add("sticky", stickyColor[type]);
// stage-todoに付箋を追加して表示、そのあと入力欄はリセット
  document.getElementById("stage-todo").appendChild(task);
  input.value = "";
}

// 付箋の移動を許可（デフォルトは禁止行為）
const allowDrop = (ev) => {
  ev.preventDefault();
}
// 付箋をピックアップした情報という情報
const drag = (ev) => {
  ev.dataTransfer.setData("text", ev.target.id);
}
// 移動した付箋を任意の場所に配置するための関数
const drop = (ev) => {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("text");
  const task = document.getElementById(id);
  ev.target.closest(".column").appendChild(task);
  saveData();
}
// 付箋が移動された際にはローカルストレージに情報が保存される
const saveData = () => {
  const data = {};
  ["todo", "doing", "done"].forEach(stage => {
    const column = document.getElementById(stage);
    data[stage] = Array.from(column.children)
      .filter(el => el.classList.contains("task"))
      .map(el => el.textContent);
  });
  sessionStorage.setItem(storageKey, JSON.stringify(data));
}
// 保存した情報は復元可能（）
const loadData = () => {
  const saved = sessionStorage.getItem(storageKey);
  if (!saved) return;
  const data = JSON.parse(saved);
  ["todo", "doing", "done"].forEach(stage => {
    const column = document.getElementById(stage);
    data[stage].forEach(text => {
      const task = createTaskElement(text);
      column.appendChild(task);
    });
  });
}
// 画面のロード時に情報を復元する
window.onload = loadData;
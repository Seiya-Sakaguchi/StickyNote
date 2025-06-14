// トップページ
const title = document.querySelector("#title");
if(title) {
  const keyframes = {
      opacity: [0, 1],
      translate: ["0 -50px", 0]
  };
  const options = {
      duration: 2000,
      easing: "ease-out",
  };
  title.animate(keyframes, options);
}

const input_box = document.querySelector("#input_box")
if(input_box) {
  const keyframe = {
      opacity: [0, 1],
      translate: ["0 50px", 0]
  };
  const options = {
      duration: 2000,
      easing: "ease-out",
  };
  input_box.animate(keyframe, options);
}



// 以下メインページ
const params = new URLSearchParams(window.location.search);
const username = params.get("user");
const storageKey = `sticky_${username}`;
document.getElementById("userLabel").textContent = `ユーザー: ${username}`;

// sticky_areaの表示の変更
const addTask = (type) => {
  // 画面幅でどちらのinputを使うかを決定
  const isMobile = window.innerWidth < 800;
  // id名を動的に組み立て
  const suffix = isMobile ? '_mb' : '_pc';
  const inputId = `input-${type}${suffix}`;
  const stickyColor = {
    low: "right-blue",
    normal: "right-green",
    high: "pink"
  };

  const input = document.getElementById(inputId);
  if (!input) return; // 万一見つからなければ何もしない

  const comment = input.value;
  if (comment.trim() === "") return;

  // 付箋生成
  const task = createTaskElement(comment);
  task.classList.add("sticky", stickyColor[type]);

  // stage-todoに追加
  document.getElementById("stage-todo").appendChild(task);
  input.value = "";
};

document.getElementById('open_btn').onclick = () => {
  document.getElementById('slide_menu').classList.add('active');
};
document.getElementById('close_btn').onclick = () => {
  document.getElementById('slide_menu').classList.remove('active');
};


let taskId = 0;
// 移動可能な付箋を作成（作成した付箋にはIDを付与）
const createTaskElement = (text, colorClass = "") => {
  const task = document.createElement("div");
  task.classList.add("task");
  if (colorClass) {
    task.classList.add(colorClass);
    task.dataset.color = colorClass;  // ← データ属性で保持
  }
  const delBtn = document.createElement('span');
  delBtn.className = 'delete-btn';
  delBtn.title = '削除';
  delBtn.textContent = '×';
  task.appendChild(delBtn);
  const stickyContent = document.createElement('div');
  stickyContent.className = 'sticky-content';
  stickyContent.textContent = text;
  task.appendChild(stickyContent);
  task.draggable = true;
  task.id = `task-${taskId++}`;
  task.ondragstart = drag;
  // スマホスワイプ対応
  let offsetX = 0, offsetY = 0, moving = false;
  task.addEventListener('touchend', function(e) {
    moving = false;
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    const column = dropTarget ? dropTarget.closest('.column') : null;
    if (column) {
      column.appendChild(task);
      task.style.position = 'relative'; // ← PCと同じように相対配置に変更
      task.style.left = '';
      task.style.top = '';
      task.style.zIndex = '';
      saveData();
    } else {
      // どこにもドロップされなかった → 元の場所 orその場に固定
      task.style.position = 'absolute'; // このまま固定しておく案もあり
    }
  });


  task.addEventListener('touchmove', function(e) {
    if (!moving) return;
    const touch = e.touches[0];
    task.style.left = (touch.clientX - offsetX) + 'px';
    task.style.top = (touch.clientY - offsetY) + 'px';
    e.preventDefault();
  });

  task.addEventListener('touchend', function(e) {
    moving = false;
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
    const column = dropTarget ? dropTarget.closest('.column') : null;
    if (column) {
      column.appendChild(task);
      // スタイルを初期化
      task.style.position = '';
      task.style.left = '';
      task.style.top = '';
      task.style.zIndex = '';
      saveData(); // 状態保存
    } else {
      // カラム外なら位置を元に戻すなど必要に応じて
    }
  })
  // ここまでスマホ対応変更箇所

  return task;
};

document.querySelector('.bord_area').addEventListener('click', function(e) {
  if (e.target.classList.contains('delete-btn')) {
    const task = e.target.closest('.task');
    if (task) {
      task.remove();
      saveData(); // 削除後に保存
    }
  }
});

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
      .map(el => ({ text: el.textContent, color: el.dataset.color || ""}));
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
    data[stage].forEach(item => {
    // itemが文字列かオブジェクトかを判定
    if (typeof item === "string") {
      const task = createTaskElement(item); // 旧形式
      column.appendChild(task);
    } else {
      const task = createTaskElement(comment, stickyColor[type]);
      task.classList.add("sticky");
    }
    });
  });
}
// 画面のロード時に情報を復元する
window.onload = loadData;
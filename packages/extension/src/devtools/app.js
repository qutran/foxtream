const fragment = document.getElementById('call-fragment');

function addCall({ model, method, input, output }) {
  const container = document.createElement('div');
  const content = fragment.content.cloneNode(true);
  content.querySelector('.model').innerText = model;
  content.querySelector('.method').innerText = method;
  content.querySelector('.args').innerText = input
    .map(s => JSON.stringify(s))
    .join(', ');
  content.querySelector('.return').innerText = JSON.stringify(output);
  container.appendChild(content);
  container.classList.add('hidden');
  document.body.appendChild(container);
  requestIdleCallback(() => {
    container.classList.add('show');
  });
}

function clear() {
  document.body.innerHTML = '';
}

function onMessage(data) {
  const { action, payload } = data;

  switch (action) {
    case 'call':
      addCall(payload);
      break;
    case 'clear':
      clear();
      break;
  }
}

window.addEventListener('message', ({ data }) => {
  if (data.action === 'batch') {
    for (const message of data.payload) {
      onMessage(message);
    }
  } else {
    onMessage(data);
  }
});

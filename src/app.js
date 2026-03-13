const questions = [
  {
    id: 'driver-return',
    text: 'Как звали водителя, который вернул Аркаше его обосранный мешок с бичпакетами и несквиком?',
    options: [
      { value: 'a', label: 'Андрей' },
      { value: 'b', label: 'Сергей' },
      { value: 'с', label: 'ИВАН' },
    ],
    // TODO: подставь нужную букву, когда будешь точно знать правильный ответ
    correct: null,
  },
  {
    id: 'baikal-left',
    text: 'Что ты, как последняя тварь, оставила на скамейке, когда мы покупали алкашку на Байкал 2024?',
    options: [
      { value: 'a', label: 'Повербанк' },
      { value: 'b', label: 'Полотенце' },
      { value: 'с', label: 'ШТАНЫ' },
    ],
    correct: null,
  },
  {
    id: 'birthday-smash',
    text: 'Что ты решила пнуть и разбить вдребезги на ночевке в честь Дня рождения Аркаши 2023?',
    options: [
      { value: 'a', label: 'Алинино еблище' },
      { value: 'b', label: 'БОКАЛ ДЛЯ ВИНА' },
      { value: 'с', label: 'Свою коленку' },
    ],
    correct: null,
  },
  {
    id: 'nastya-quote',
    text: 'Какую фразу НЕ говорила твоя любимая, самая лучшая подружка Настенка Берри?',
    options: [
      { value: 'a', label: 'кокос не вопрос' },
      { value: 'b', label: 'время 8:25 с мамой мы идём гулять' },
      { value: 'с', label: 'МУЛАТКА-ШОКОЛАДКА' },
    ],
    correct: null,
  },
  {
    id: 'gift',
    text: 'Подарок мой?',
    options: [
      { value: 'a', label: 'да' },
      { value: 'b', label: 'нет' },
      { value: 'с', label: 'водитель, остановите пожалуйста.....' },
    ],
    correct: 'с',
  },
];

const questionList = document.querySelector('[data-question-list]');
const form = document.getElementById('quiz-form');
const resultModal = document.getElementById('result-modal');
const resultMessageEl = resultModal.querySelector('[data-result-message]');
const resultDetailsEl = resultModal.querySelector('[data-result-details]');
const modalClose = resultModal.querySelector('[data-close]');
const warningMessage = document.querySelector('[data-warning]');

function getCorrectAnswers() {
  return questions.reduce((acc, question) => {
    if (question.correct) {
      acc[question.id] = question.correct;
    }
    return acc;
  }, {});
}

function renderQuestions() {
  questionList.innerHTML = questions
    .map((question, index) => {
      const options = question.options
        .map(
          (option) => `
            <label class="option">
              <input type="radio" name="${question.id}" value="${option.value}" />
              <span>${option.value}) ${option.label}</span>
            </label>
          `
        )
        .join('');

      return `
        <fieldset class="question">
          <legend>${index + 1}) ${question.text}</legend>
          <div class="options">${options}</div>
        </fieldset>
      `;
    })
    .join('');
}

function collectAnswers() {
  return questions.reduce((answers, question) => {
    const selected = document.querySelector(
      `input[name="${question.id}"]:checked`
    );
    if (selected) {
      answers[question.id] = selected.value;
    }
    return answers;
  }, {});
}

function evaluateAnswers() {
  const answers = collectAnswers();
  const correctMap = getCorrectAnswers();
  const answeredCount = Object.keys(answers).length;
  const score = Object.entries(answers).reduce((total, [id, value]) => {
    if (correctMap[id] && correctMap[id] === value) {
      return total + 1;
    }
    return total;
  }, 0);

  return {
    answeredCount,
    score,
    answers,
  };
}

function buildVerdict({ answeredCount, score }) {
  if (answeredCount === 0) {
    return 'Ты вообще не дочитала до вопросов. Лошара чистой воды.';
  }

  if (answeredCount < 3) {
    return 'Ты лошара, ничего не помнишь базовых вещей. Надо больше внимания.';
  }

  if (score >= answeredCount && score === questions.length) {
    return 'Всё, шутки кончились — ты помнишь всё, как надо.';
  }

  return 'Вроде бы что-то вспомнила, но не расслабляйся — парочка ответов могла проскакивать из памяти.';
}

function formatDetails({ answeredCount, score }) {
  const incorrect = answeredCount - score;
  const fragments = [
    `Ответила на ${answeredCount} из ${questions.length} вопросов.`,
    `Верно: ${score}.`,
  ];
  if (incorrect > 0) {
    fragments.push(`Не угадала/не ответила точно на ${incorrect}.`);
  }
  if (answeredCount < questions.length) {
    fragments.push('Остались вопросы без ответа — можно доделать позже.');
  }
  return fragments;
}

function toggleModal(open, payload) {
  if (open) {
    resultMessageEl.textContent = buildVerdict(payload);
    resultDetailsEl.innerHTML = formatDetails(payload)
      .map((line) => `<li>${line}</li>`)
      .join('');
    resultModal.hidden = false;
    resultModal.setAttribute('aria-hidden', 'false');
  } else {
    resultModal.hidden = true;
    resultModal.setAttribute('aria-hidden', 'true');
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const result = evaluateAnswers();
  const allAnswered = result.answeredCount === questions.length;
  if (!allAnswered) {
    warningMessage.hidden = false;
    warningMessage.textContent = `Ты ответила только на ${result.answeredCount} из ${questions.length} вопросов. Заверши викторину, чтобы увидеть попап с результатом.`;
    return;
  }
  warningMessage.hidden = true;
  toggleModal(true, result);
});

modalClose.addEventListener('click', () => toggleModal(false));
resultModal.addEventListener('click', (event) => {
  if (event.target === resultModal) {
    toggleModal(false);
  }
});

renderQuestions();

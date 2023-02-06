import './css/styles.css';

let sessionKey = '';
let categories = [];
getSessionKey();
getCategories();

let questionList;

function getSessionKey() {
  let tokenRequest = new XMLHttpRequest();
  const url = `https://opentdb.com/api_token.php?command=request`;
  tokenRequest.addEventListener("loadend", function () {
    let response = JSON.parse(this.responseText);
    sessionKey = response.token;
  });
  tokenRequest.open("GET", url, true);
  tokenRequest.send();
}
function getCategories() {
  let catRequest = new XMLHttpRequest();
  const url = `https://opentdb.com/api_category.php`;
  catRequest.addEventListener("loadend", function () {
    let response = JSON.parse(this.responseText);
    categories = response.trivia_categories;
    for (const obj of categories) {
      document.getElementById('subject-select').innerHTML += `
        <option name=${obj.id}>${obj.name}</option>
      `;
    }
  });
  catRequest.open("GET", url, true);
  catRequest.send();
}

document.getElementById('trivia-form').addEventListener('submit', handleStartGameClick);

function getIDForCategory(categoryName) {
  for (const obj of categories) {
    if (obj.name === categoryName) {
      return obj.id;
    }
  }
}

async function createTriviaCards() {
  // document.getElementById('card-area').innerHTML = `<form id="answers-form">`;
  let answersForm = document.createElement('form');
  answersForm.id = 'answers-form';
  for (const questionObj of questionList) {
    let cardObj = document.createElement('div');
    cardObj.classList.add('trivia-card');
    let choicesHTML = '';
    if (questionObj.type === 'boolean') {
      choicesHTML = `
        <div>
          <input type="radio" id="true-${questionList.indexOf(questionObj)}" name="boolean" value="true">
          <label for="true-${questionList.indexOf(questionObj)}">True</label>
        </div>
        <div>
          <input type="radio" id="false-${questionList.indexOf(questionObj)}" name="boolean" value="false">
          <label for="false-${questionList.indexOf(questionObj)}">False</label>
        </div>
      `;
    } else {
      // make array of answers with correct at random index

      let totalChoices = questionObj.incorrect_answers.length + 1;
      let correctIndex = randomInt(0, totalChoices);
      let choiceArray = [...questionObj.incorrect_answers];
      choiceArray.splice(correctIndex, 0, questionObj.correct_answer);
      for (const choice of choiceArray) {
        choicesHTML += `
          <div>
            <input type="radio" id="${choice}" name="${questionObj.question}" value="choice">
            <label for="${choice}">${choice}</label>
          </div>
        `;
      }
    }
    cardObj.innerHTML = `
      <h4>${questionObj.category}</h4>
      <div class="question">${questionObj.question}</div>
      ${choicesHTML}
    `;

    document.getElementById('card-area').append(answersForm);
    answersForm.append(cardObj);
    await pause(100);
    cardObj.classList.add('showing');
  }
}

async function handleStartGameClick(e) {
  e.preventDefault();
  document.getElementById('card-area').innerHTML = '';
  document.getElementById('trivia-form').classList.add('working');
  questionList = [];
  let request = new XMLHttpRequest();
  let questionCount = document.getElementById('question-count').value;
  let subjectID = getIDForCategory(document.getElementById('subject-select').value);
  let difficulty = document.getElementById('difficulty-select').value.toLowerCase();
  const url = `https://opentdb.com/api.php?amount=${questionCount}&category=${subjectID}&difficulty=${difficulty}`;
  request.addEventListener("loadend", async function () {
    let response = JSON.parse(this.responseText);
    if (response.results.length) {
      document.getElementById('trivia-form').classList.remove('working');
      questionList = response.results;
      await createTriviaCards();
      createCheckAnswersButton();
    }
  });

  request.open("GET", url, true);
  request.send();
}

function createCheckAnswersButton() {
  document.getElementById('answers-form').innerHTML += `
    <div class="button-end">
      <button type="submit">Check Answers</button>
    </div>
  `;
  document.getElementById('answers-form').addEventListener('submit', handleCheckAnswersClick);
}

function handleCheckAnswersClick(e) {
  e.preventDefault();
  for (const el of document.getElementsByClassName('trivia-card')) {
    console.log('checking el', el)
  }
}

const randomInt = (min, max) => Math.round(Math.random() * (max - min) + min);
const pause = async ms => new Promise(resolve => setTimeout(resolve, ms));